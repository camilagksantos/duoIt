package com.duoit.api.progress;

/**
 * total: cards marcados como aprendidos no grupo.
 * answered: cards com a primeira avaliação do exercício feita.
 * correct: cards cuja primeira avaliação do exercício foi acerto (Bom ou Fácil).
 * completed: Termos do Grupo concluídos.
 * concluded: pelo menos 80% dos cards acertados. Libera o grupo seguinte.
 */
public record SubmoduleProgress(String slug, long total, long answered, long correct, boolean completed,
		boolean concluded) {

	/** Limiar de acertos para concluir o grupo. */
	public static boolean isConcludedBy(long total, long correct) {
		return total > 0 && correct * 5 >= total * 4;
	}
}
