package com.duoit.api.study;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.model.Card;
import com.duoit.api.model.Rating;
import com.duoit.api.repository.CardRepository;
import com.duoit.api.scheduling.FsrsScheduler;

/**
 * Ponto único de avaliação de cards. Todos os fluxos (Cards do grupo e Cards Review)
 * passam por aqui, então o agendamento FSRS não é duplicado.
 */
@Service
public class CardService {

	public static final int NEW_CARDS_PER_DAY = 10;

	private final CardRepository cards;

	public CardService(CardRepository cards) {
		this.cards = cards;
	}

	/**
	 * Registra a avaliação e recalcula o agendamento. Retorna o próximo vencimento, ou vazio se o card não existir.
	 * {@code countsForProgress} é verdadeiro só para avaliações feitas no exercício do grupo.
	 */
	@Transactional
	public Optional<Instant> answer(Long cardId, Rating rating, Instant now, LocalDate today, boolean countsForProgress) {
		Optional<Card> card = cards.findById(cardId);
		if (card.isEmpty()) {
			return Optional.empty();
		}
		FsrsScheduler.Memory next = FsrsScheduler.review(card.get().memory(), rating, now);
		card.get().applyMemory(next, today);
		if (countsForProgress) {
			boolean correct = rating == Rating.GOOD || rating == Rating.EASY;
			card.get().markExerciseAnswered(now, correct);
		}
		return Optional.of(next.dueAt());
	}
}
