package com.duoit.api.model;

import java.time.LocalDate;

import com.duoit.api.scheduling.Sm2Scheduler;

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
	private int repetitions;

	@Column(nullable = false)
	private double easeFactor;

	@Column(nullable = false)
	private int intervalDays;

	@Column(nullable = false)
	private int lapses;

	private LocalDate dueDate;

	/** Dia em que o card foi respondido pela primeira vez. Usado para o limite de novos por dia. */
	private LocalDate introducedOn;

	protected Card() {
	}

	public Card(Word word) {
		this.word = word;
		this.state = CardState.NEW;
		this.repetitions = 0;
		this.easeFactor = Sm2Scheduler.INITIAL_EASE;
		this.intervalDays = 0;
		this.lapses = 0;
	}

	public Sm2Scheduler.State sm2State() {
		return new Sm2Scheduler.State(repetitions, easeFactor, intervalDays, lapses);
	}

	public void applyOutcome(Sm2Scheduler.Outcome outcome, LocalDate today) {
		Sm2Scheduler.State s = outcome.state();
		this.state = CardState.REVIEW;
		this.repetitions = s.repetitions();
		this.easeFactor = s.ease();
		this.intervalDays = s.intervalDays();
		this.lapses = s.lapses();
		this.dueDate = outcome.dueDate();
		if (this.introducedOn == null) {
			this.introducedOn = today;
		}
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

	public LocalDate getDueDate() {
		return dueDate;
	}

	public LocalDate getIntroducedOn() {
		return introducedOn;
	}
}
