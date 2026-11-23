package com.duoit.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "words")
public class Word {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String term;

	@Column(nullable = false)
	private String meaning;

	@Column(nullable = false, length = 500)
	private String example;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "submodule_id", nullable = false)
	private Submodule submodule;

	protected Word() {
	}

	public Word(String term, String meaning, String example, Submodule submodule) {
		this.term = term;
		this.meaning = meaning;
		this.example = example;
		this.submodule = submodule;
	}

	/** Atualiza o significado e o exemplo. O card desta palavra e o seu progresso não mudam. */
	public void update(String meaning, String example) {
		this.meaning = meaning;
		this.example = example;
	}

	public Long getId() {
		return id;
	}

	public String getTerm() {
		return term;
	}

	public String getMeaning() {
		return meaning;
	}

	public String getExample() {
		return example;
	}

	public Submodule getSubmodule() {
		return submodule;
	}
}
