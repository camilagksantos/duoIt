package com.duoit.api.progress;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.repository.CardRepository;

@Service
public class ProgressService {

	private final CardRepository cards;

	public ProgressService(CardRepository cards) {
		this.cards = cards;
	}

	/** Só retorna grupos com cards marcados. Grupo sem palavras marcadas não aparece. */
	@Transactional(readOnly = true)
	public List<SubmoduleProgress> bySubmodule() {
		return cards.progressBySubmodule().stream()
				.map(row -> new SubmoduleProgress(row.getSlug(), row.getTotal(),
						row.getAnswered() == null ? 0 : row.getAnswered()))
				.toList();
	}
}
