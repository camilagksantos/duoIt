package com.duoit.api.model;

import java.time.Instant;
import java.time.LocalDate;

import com.duoit.api.scheduling.FsrsScheduler;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Card de uma palavra marcada como aprendida. Guarda o estado do agendamento FSRS.
 * {@code paused} tira a palavra do Review sem apagar o histórico.
 */
@Entity
@Table(name = "cards")
public class Card {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "word_id", nullable = false, unique = true)
	private Word word;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private CardState state;

	@Column(nullable = false)
	private int step;

	@Column(nullable = false)
	private double stability;

	@Column(nullable = false)
	private double difficulty;

	@Column(nullable = false)
	private int reps;

	@Column(nullable = false)
	private int lapses;

	private Instant lastReview;

	@Column(nullable = false)
	private Instant dueAt;

	/** Dia da primeira avaliação. Usado para o limite de novos cards por dia. */
	private LocalDate introducedOn;

	@Column(nullable = false)
	private boolean paused;

	protected Card() {
	}

	public Card(Word word, Instant now) {
		this.word = word;
		this.paused = false;
		applyMemory(FsrsScheduler.Memory.newCard(now), null);
	}

	public FsrsScheduler.Memory memory() {
		return new FsrsScheduler.Memory(state, step, stability, difficulty, reps, lapses, lastReview, dueAt);
	}

	public void applyMemory(FsrsScheduler.Memory m, LocalDate today) {
		this.state = m.state();
		this.step = m.step();
		this.stability = m.stability();
		this.difficulty = m.difficulty();
		this.reps = m.reps();
		this.lapses = m.lapses();
		this.lastReview = m.lastReview();
		this.dueAt = m.dueAt();
		if (today != null && this.introducedOn == null) {
			this.introducedOn = today;
		}
	}

	public void pause() {
		this.paused = true;
	}

	public void resume() {
		this.paused = false;
	}

	public Long getId() {
		return id;
	}

	public Word getWord() {
		return word;
	}

	public CardState getState() {
		return state;
	}

	public Instant getDueAt() {
		return dueAt;
	}

	public LocalDate getIntroducedOn() {
		return introducedOn;
	}

	public boolean isPaused() {
		return paused;
	}
}
