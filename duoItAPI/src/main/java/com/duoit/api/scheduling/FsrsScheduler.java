package com.duoit.api.scheduling;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import com.duoit.api.model.CardState;
import com.duoit.api.model.Rating;

/**
 * Máquina de estados do agendamento: novo, aprendizado com passos curtos, revisão e reaprendizado.
 *
 * Passos padrão: aprendizado em 1 min e 10 min; reaprendizado em 10 min.
 * Simplificação: a estabilidade e a dificuldade são atualizadas na graduação e no esquecimento,
 * e não a cada passo de aprendizado.
 *
 * Função pura: recebe o estado atual, a nota e o instante, e devolve o novo estado.
 */
public final class FsrsScheduler {

	static final List<Duration> LEARNING_STEPS = List.of(Duration.ofMinutes(1), Duration.ofMinutes(10));
	static final List<Duration> RELEARNING_STEPS = List.of(Duration.ofMinutes(10));

	private FsrsScheduler() {
	}

	/** Memória de um card. {@code lastReview} é nulo enquanto o card nunca foi revisado. */
	public record Memory(CardState state, int step, double stability, double difficulty,
			int reps, int lapses, Instant lastReview, Instant dueAt) {

		public static Memory newCard(Instant now) {
			return new Memory(CardState.NEW, 0, 0, 0, 0, 0, null, now);
		}
	}

	public static Memory review(Memory m, Rating rating, Instant now) {
		int grade = grade(rating);
		return switch (m.state()) {
			case NEW, LEARNING, RELEARNING -> learningStep(m, grade, now);
			case REVIEW -> reviewStep(m, grade, now);
		};
	}

	/** Minutos até o próximo vencimento para cada nota, sem alterar o estado. Usado nos botões. */
	public static long minutesUntilDue(Memory m, Rating rating, Instant now) {
		Memory next = review(m, rating, now);
		return Math.max(1, Duration.between(now, next.dueAt()).toMinutes());
	}

	static int grade(Rating rating) {
		return switch (rating) {
			case AGAIN -> 1;
			case HARD -> 2;
			case GOOD -> 3;
			case EASY -> 4;
		};
	}

	private static Memory learningStep(Memory m, int grade, Instant now) {
		boolean relearning = m.state() == CardState.RELEARNING;
		List<Duration> steps = relearning ? RELEARNING_STEPS : LEARNING_STEPS;
		boolean fresh = m.state() == CardState.NEW;

		double stability = fresh ? Fsrs.initialStability(grade) : m.stability();
		double difficulty = fresh ? Fsrs.initialDifficulty(grade) : m.difficulty();
		int reps = m.reps() + 1;
		CardState inStep = relearning ? CardState.RELEARNING : CardState.LEARNING;

		if (grade == 1) {
			return new Memory(inStep, 0, stability, difficulty, reps, m.lapses(), now, now.plus(steps.get(0)));
		}
		if (grade == 2) {
			int step = Math.min(m.step(), steps.size() - 1);
			return new Memory(inStep, step, stability, difficulty, reps, m.lapses(), now, now.plus(steps.get(step)));
		}
		boolean lastStep = m.step() + 1 >= steps.size();
		if (grade == 3 && !lastStep) {
			int step = m.step() + 1;
			return new Memory(inStep, step, stability, difficulty, reps, m.lapses(), now, now.plus(steps.get(step)));
		}
		// Graduação: Bom no último passo, ou Fácil a qualquer momento.
		long days = Fsrs.intervalDays(stability);
		return new Memory(CardState.REVIEW, 0, stability, difficulty, reps, m.lapses(), now, now.plusSeconds(days * 86400));
	}

	private static Memory reviewStep(Memory m, int grade, Instant now) {
		double elapsedDays = Math.max(0, Duration.between(m.lastReview(), now).toMinutes() / 1440.0);
		double retrievability = Fsrs.retrievability(elapsedDays, m.stability());
		int reps = m.reps() + 1;

		if (grade == 1) {
			double stability = Fsrs.forgetStability(m.stability(), m.difficulty(), retrievability);
			double difficulty = Fsrs.nextDifficulty(m.difficulty(), grade);
			return new Memory(CardState.RELEARNING, 0, stability, difficulty, reps, m.lapses() + 1, now,
					now.plus(RELEARNING_STEPS.get(0)));
		}
		double stability = Fsrs.recallStability(m.stability(), m.difficulty(), retrievability, grade);
		double difficulty = Fsrs.nextDifficulty(m.difficulty(), grade);
		long days = Fsrs.intervalDays(stability);
		return new Memory(CardState.REVIEW, 0, stability, difficulty, reps, m.lapses(), now,
				now.plusSeconds(days * 86400));
	}
}
