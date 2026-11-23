package com.duoit.api.study;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;

import com.duoit.api.model.Card;
import com.duoit.api.model.CardState;
import com.duoit.api.model.Rating;
import com.duoit.api.scheduling.Sm2Scheduler;

/** Visão do card enviada ao front. Montada dentro da transação para evitar lazy loading. */
public record CardView(
		Long id,
		String term,
		String meaning,
		String example,
		String moduleTitle,
		String submoduleTitle,
		boolean isNew,
		Map<Rating, Integer> intervals) {

	static CardView from(Card card, LocalDate today) {
		var word = card.getWord();
		var submodule = word.getSubmodule();
		var intervals = new EnumMap<Rating, Integer>(Rating.class);
		for (Rating rating : Rating.values()) {
			intervals.put(rating, Sm2Scheduler.previewDays(card.sm2State(), rating, today));
		}
		return new CardView(
				card.getId(),
				word.getTerm(),
				word.getMeaning(),
				word.getExample(),
				submodule.getModule().getTitle(),
				submodule.getTitle(),
				card.getState() == CardState.NEW,
				intervals);
	}
}
