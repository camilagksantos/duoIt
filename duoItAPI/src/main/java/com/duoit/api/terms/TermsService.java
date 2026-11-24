package com.duoit.api.terms;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.model.Card;
import com.duoit.api.model.Submodule;
import com.duoit.api.model.Word;
import com.duoit.api.progress.ProgressService;
import com.duoit.api.progress.SubmoduleProgress;
import com.duoit.api.repository.CardRepository;
import com.duoit.api.repository.SubmoduleRepository;
import com.duoit.api.repository.WordRepository;

/**
 * Termos do Grupo. Os termos são só para estudo até o grupo ser concluído.
 * Concluir inclui todas as palavras do grupo no Review, de uma vez, e não pode ser desfeito.
 */
@Service
public class TermsService {

	private final SubmoduleRepository submodules;
	private final WordRepository words;
	private final CardRepository cards;
	private final ProgressService progress;

	public TermsService(SubmoduleRepository submodules, WordRepository words, CardRepository cards,
			ProgressService progress) {
		this.submodules = submodules;
		this.words = words;
		this.cards = cards;
		this.progress = progress;
	}

	@Transactional(readOnly = true)
	public Optional<TermsResponse> terms(String slug) {
		return submodules.findBySlug(slug).map(submodule -> new TermsResponse(
				submodule.isCompleted(),
				words.findBySubmoduleSlugOrderByIdAsc(slug).stream().map(TermView::from).toList()));
	}

	/** Grupo está liberado quando todos os anteriores na ordem de estudo estão concluídos (80% de acertos). */
	@Transactional(readOnly = true)
	public boolean isUnlocked(String slug) {
		Map<String, SubmoduleProgress> bySlug = progress.bySlug();
		for (Submodule submodule : submodules.findAllByOrderByModulePositionAscPositionAsc()) {
			if (submodule.getSlug().equals(slug)) {
				return true;
			}
			SubmoduleProgress p = bySlug.get(submodule.getSlug());
			if (p == null || !p.concluded()) {
				return false;
			}
		}
		return false;
	}

	/** Conclui o grupo e inclui suas palavras no Review. */
	@Transactional
	public CompleteResult complete(String slug, Instant now) {
		Optional<Submodule> found = submodules.findBySlug(slug);
		if (found.isEmpty()) {
			return CompleteResult.NOT_FOUND;
		}
		if (!isUnlocked(slug)) {
			return CompleteResult.LOCKED;
		}
		Submodule submodule = found.get();
		submodule.complete(now);
		for (Word word : words.findBySubmoduleSlugOrderByIdAsc(slug)) {
			if (cards.findByWord(word).isEmpty()) {
				cards.save(new Card(word, now));
			}
		}
		return CompleteResult.COMPLETED;
	}

	public enum CompleteResult {
		COMPLETED, NOT_FOUND, LOCKED
	}

	public record TermsResponse(boolean completed, List<TermView> terms) {
	}

	public record TermView(Long id, String term, String meaning, String example) {

		static TermView from(Word word) {
			return new TermView(word.getId(), word.getTerm(), word.getMeaning(), word.getExample());
		}
	}
}
