package com.duoit.api.study;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.model.Card;
import com.duoit.api.model.CardState;
import com.duoit.api.model.Rating;
import com.duoit.api.repository.CardRepository;
import com.duoit.api.scheduling.Sm2Scheduler;

@Service
public class StudySessionService {

	static final int NEW_CARDS_PER_DAY = 10;

	private final CardRepository cards;
	private final CardProvisioner provisioner;

	public StudySessionService(CardRepository cards, CardProvisioner provisioner) {
		this.cards = cards;
		this.provisioner = provisioner;
	}

	/**
	 * Sessão de um submódulo: reviews vencidos primeiro, depois novos cards até o limite diário,
	 * na ordem das palavras.
	 */
	@Transactional
	public List<CardView> sessionViews(LocalDate today, String slug) {
		provisioner.ensureCards();

		int introducedToday = (int) cards.countByIntroducedOn(today);
		int newLeft = Math.max(0, NEW_CARDS_PER_DAY - introducedToday);

		List<Card> session = new ArrayList<>(cards.findDueInSubmodule(CardState.REVIEW, today, slug));
		if (newLeft > 0) {
			session.addAll(cards.findNewInSubmodule(CardState.NEW, slug, PageRequest.of(0, newLeft)));
		}
		return session.stream().map(card -> CardView.from(card, today)).toList();
	}

	/** Registra a avaliação. Retorna false se o card não existir. */
	@Transactional
	public boolean answer(Long cardId, Rating rating, LocalDate today) {
		Optional<Card> card = cards.findById(cardId);
		if (card.isEmpty()) {
			return false;
		}
		Sm2Scheduler.Outcome outcome = Sm2Scheduler.review(card.get().sm2State(), rating, today);
		card.get().applyOutcome(outcome, today);
		return true;
	}
}
