package com.duoit.api.progress;

/**
 * total: cards marcados como aprendidos no grupo.
 * answered: cards já avaliados pelo menos uma vez.
 */
public record SubmoduleProgress(String slug, long total, long answered) {
}
