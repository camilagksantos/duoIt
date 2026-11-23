package com.duoit.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "learning_modules")
public class LearningModule {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false)
	private int position;

	protected LearningModule() {
	}

	public LearningModule(String title, int position) {
		this.title = title;
		this.position = position;
	}

	public Long getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public int getPosition() {
		return position;
	}
}
