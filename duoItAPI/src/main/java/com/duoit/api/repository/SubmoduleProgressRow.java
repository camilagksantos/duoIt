package com.duoit.api.repository;

/** Projeção: por submódulo, total de cards, respondidos pelo menos uma vez e dominados. */
public interface SubmoduleProgressRow {

	String getSlug();

	long getTotal();

	Long getAnswered();

	Long getMastered();
}
