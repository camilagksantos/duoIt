package com.duoit.api.model;

public enum CardState {
	/** Marcado como aprendido, ainda sem nenhuma avaliação. */
	NEW,
	/** Em passos curtos de aprendizado. */
	LEARNING,
	/** Em revisão, agendado pelo FSRS. */
	REVIEW,
	/** Esquecido: em passos curtos de reaprendizado. */
	RELEARNING
}
