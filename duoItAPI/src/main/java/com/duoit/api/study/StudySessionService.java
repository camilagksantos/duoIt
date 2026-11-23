package com.duoit.api.study;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.model.Card;
import com.duoit.api.model.CardState;
import com.duoit.api.repository.CardRepository;

/** Sessão de um grupo: cards vencidos primeiro, depois novos até o limite diário. */
@Service
public class StudySessionService {

	private final CardRepository cards;

	public StudySessionService(CardRepository cards) {
		this.cards = cards;
	}

	@Transactional(readOnly = true)
	public List<CardView> sessionViews(Instant now, LocalDate today, String slug) {
		int newLeft = Math.max(0, CardService.NEW_CARDS_PER_DAY - (int) cards.countByIntroducedOn(today));

		List<Card> session = new ArrayList<>();
		cards.findDue(CardState.NEW, now).stream()
				.filter(c -> slug.equals(c.getWord().getSubmodule().getSlug()))
				.forEach(session::add);
		cards.findNew(CardState.NEW).stream()
				.filter(c -> slug.equals(c.getWord().getSubmodule().getSlug()))
				.limit(newLeft)
				.forEach(session::add);
		return session.stream().map(card -> CardView.from(card, now)).toList();
	}
}
