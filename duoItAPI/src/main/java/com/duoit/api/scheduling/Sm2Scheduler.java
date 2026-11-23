package com.duoit.api.scheduling;

import java.time.LocalDate;

import com.duoit.api.model.Rating;

/**
 * Agendamento de repetição espaçada baseado no SM-2, com os ajustes de intervalo
 * do Anki (Difícil, Bom, Fácil e Errei).
 *
 * Função pura: não acessa banco nem relógio. Recebe o estado atual e devolve o novo.
 */
public final class Sm2Scheduler {

	public static final double INITIAL_EASE = 2.5;
	static final double MIN_EASE = 1.3;

	private static final double EASE_STEP = 0.15;
	private static final double EASE_PENALTY_AGAIN = 0.20;
	private static final double HARD_FACTOR = 1.2;
	private static final double EASY_BONUS = 1.3;
	private static final int FIRST_INTERVAL = 1;
	private static final int SECOND_INTERVAL = 6;
	private static final int EASY_FIRST_INTERVAL = 4;

	private Sm2Scheduler() {
	}

	public record State(int repetitions, double ease, int intervalDays, int lapses) {
		public static State initial() {
			return new State(0, INITIAL_EASE, 0, 0);
		}
	}

	public record Outcome(State state, LocalDate dueDate) {
	}

	public static Outcome review(State s, Rating rating, LocalDate today) {
		return switch (rating) {
			case AGAIN -> {
				double ease = Math.max(MIN_EASE, s.ease() - EASE_PENALTY_AGAIN);
				State next = new State(0, ease, FIRST_INTERVAL, s.lapses() + 1);
				yield new Outcome(next, today.plusDays(FIRST_INTERVAL));
			}
			case HARD -> {
				double ease = Math.max(MIN_EASE, s.ease() - EASE_STEP);
				int interval = s.repetitions() == 0
						? FIRST_INTERVAL
						: Math.max(FIRST_INTERVAL, (int) Math.round(s.intervalDays() * HARD_FACTOR));
				yield advance(s, ease, interval, today);
			}
			case GOOD -> advance(s, s.ease(), growInterval(s), today);
			case EASY -> {
				double ease = s.ease() + EASE_STEP;
				int interval = s.repetitions() == 0
						? EASY_FIRST_INTERVAL
						: (int) Math.round(growInterval(s) * EASY_BONUS);
				yield advance(s, ease, interval, today);
			}
		};
	}

	/** Intervalo em dias para cada avaliação, sem alterar o estado. Usado para mostrar nos botões. */
	public static int previewDays(State s, Rating rating, LocalDate today) {
		return review(s, rating, today).state().intervalDays();
	}

	private static int growInterval(State s) {
		if (s.repetitions() == 0) {
			return FIRST_INTERVAL;
		}
		if (s.repetitions() == 1) {
			return SECOND_INTERVAL;
		}
		return (int) Math.round(s.intervalDays() * s.ease());
	}

	private static Outcome advance(State s, double ease, int interval, LocalDate today) {
		State next = new State(s.repetitions() + 1, ease, interval, s.lapses());
		return new Outcome(next, today.plusDays(interval));
	}
}
