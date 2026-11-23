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
@Table(name = "submodules")
public class Submodule {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** Identificador estável, igual ao id do submódulo no front (ex.: "basic-work-routine"). */
	@Column(nullable = false, unique = true)
	private String slug;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false)
	private int position;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "module_id", nullable = false)
	private LearningModule module;

	protected Submodule() {
	}

	public Submodule(String slug, String title, int position, LearningModule module) {
		this.slug = slug;
		this.title = title;
		this.position = position;
		this.module = module;
	}

	/** Atualiza título e posição vindos do conteúdo. */
	public void update(String title, int position) {
		this.title = title;
		this.position = position;
	}

	public Long getId() {
		return id;
	}

	public String getSlug() {
		return slug;
	}

	public String getTitle() {
		return title;
	}

	public int getPosition() {
		return position;
	}

	public LearningModule getModule() {
		return module;
	}
}
