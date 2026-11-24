package com.duoit.api.progress;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.repository.CardRepository;

@Service
public class ProgressService {

	private final CardRepository cards;

	public ProgressService(CardRepository cards) {
		this.cards = cards;
	}

	/**
	 * Quantos tipos de exercício já existem. Enquanto for 0, a conclusão do grupo depende só dos Termos
	 * (plano, regra 5: tipos ainda não disponíveis não bloqueiam a sequência).
	 * Ao implementar o primeiro tipo, trocar esta regra pelos 80% de acertos.
	 */
	static final int IMPLEMENTED_EXERCISE_TYPES = 0;

	/** Só retorna grupos com cards marcados. Grupo sem palavras marcadas não aparece. */
	@Transactional(readOnly = true)
	public List<SubmoduleProgress> bySubmodule() {
		return cards.progressBySubmodule().stream()
				.map(row -> {
					long correct = row.getCorrect() == null ? 0 : row.getCorrect();
					boolean termsDone = row.getCompletedAt() != null;
					boolean concluded = IMPLEMENTED_EXERCISE_TYPES == 0
							? termsDone
							: termsDone && SubmoduleProgress.isConcludedBy(row.getTotal(), correct);
					return new SubmoduleProgress(row.getSlug(), row.getTotal(),
							row.getAnswered() == null ? 0 : row.getAnswered(), correct, termsDone, concluded);
				})
				.toList();
	}

	/** Progresso por slug, para checagens de desbloqueio. */
	@Transactional(readOnly = true)
	public Map<String, SubmoduleProgress> bySlug() {
		return bySubmodule().stream().collect(Collectors.toMap(SubmoduleProgress::slug, p -> p));
	}
}
