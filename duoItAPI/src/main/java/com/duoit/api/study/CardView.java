package com.duoit.api.study;

import java.time.Instant;
import java.util.EnumMap;
import java.util.Map;

import com.duoit.api.model.Card;
import com.duoit.api.model.CardState;
import com.duoit.api.model.Rating;
import com.duoit.api.scheduling.FsrsScheduler;

/**
 * Visão do card enviada ao front. {@code intervals} traz, para cada nota, os minutos até a
 * próxima revisão, para mostrar nos botões.
 */
public record CardView(
		Long id,
		String term,
		String meaning,
		String example,
		String moduleTitle,
		String submoduleTitle,
		boolean isNew,
		Map<Rating, Long> intervals) {

	public static CardView from(Card card, Instant now) {
		var word = card.getWord();
		var submodule = word.getSubmodule();
		var intervals = new EnumMap<Rating, Long>(Rating.class);
		for (Rating rating : Rating.values()) {
			intervals.put(rating, FsrsScheduler.minutesUntilDue(card.memory(), rating, now));
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
