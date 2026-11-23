package com.duoit.api.repository;

/** Projeção: por grupo, total de cards marcados e quantos já foram avaliados pelo menos uma vez. */
public interface SubmoduleProgressRow {

	String getSlug();

	long getTotal();

	Long getAnswered();
}
