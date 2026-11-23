package com.duoit.api.review;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.model.Card;
import com.duoit.api.model.CardState;
import com.duoit.api.repository.CardRepository;
import com.duoit.api.study.CardService;
import com.duoit.api.study.CardView;

/**
 * Sessão do Cards Review: cards vencidos de todos os grupos, sem limite total.
 * Novos cards entram até o limite diário. Cards não respondidos continuam na fila.
 */
@Service
public class ReviewSessionService {

	private final CardRepository cards;

	public ReviewSessionService(CardRepository cards) {
		this.cards = cards;
	}

	@Transactional(readOnly = true)
	public List<CardView> sessionViews(Instant now, LocalDate today) {
		int newLeft = Math.max(0, CardService.NEW_CARDS_PER_DAY - (int) cards.countByIntroducedOn(today));

		List<Card> session = new ArrayList<>(cards.findDue(CardState.NEW, now));
		session.addAll(cards.findNew(CardState.NEW).stream().limit(newLeft).toList());
		return session.stream().map(card -> CardView.from(card, now)).toList();
	}
}
