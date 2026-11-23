package com.duoit.api.progress;

/**
 * total: cards do grupo.
 * answered: cards respondidos pelo menos uma vez (concluído).
 * mastered: cards com intervalo de pelo menos 21 dias (dominado).
 */
public record SubmoduleProgress(String slug, long total, long answered, long mastered) {
}
