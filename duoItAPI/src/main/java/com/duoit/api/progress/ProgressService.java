package com.duoit.api.progress;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.model.CardState;
import com.duoit.api.repository.CardRepository;
import com.duoit.api.study.CardProvisioner;

@Service
public class ProgressService {

	/** Intervalo mínimo, em dias, para considerar um card dominado. */
	static final int MASTERED_INTERVAL_DAYS = 21;

	private final CardRepository cards;
	private final CardProvisioner provisioner;

	public ProgressService(CardRepository cards, CardProvisioner provisioner) {
		this.cards = cards;
		this.provisioner = provisioner;
	}

	/** Só retorna submódulos que têm cards. Submódulo sem palavras ainda não tem conteúdo. */
	@Transactional
	public List<SubmoduleProgress> bySubmodule() {
		provisioner.ensureCards();
		return cards.progressBySubmodule(CardState.REVIEW, MASTERED_INTERVAL_DAYS).stream()
				.map(row -> new SubmoduleProgress(
						row.getSlug(),
						row.getTotal(),
						row.getAnswered() == null ? 0 : row.getAnswered(),
						row.getMastered() == null ? 0 : row.getMastered()))
				.toList();
	}
}
