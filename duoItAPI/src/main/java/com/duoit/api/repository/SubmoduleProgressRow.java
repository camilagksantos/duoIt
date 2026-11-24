package com.duoit.api.repository;

import java.time.Instant;

/** Projeção: por grupo, total de cards marcados, quantos já foram avaliados, quantos acertaram e a data de conclusão dos Termos. */
public interface SubmoduleProgressRow {

	String getSlug();

	long getTotal();

	Long getAnswered();

	Long getCorrect();

	Instant getCompletedAt();
}
