package com.duoit.api.terms;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.model.Card;
import com.duoit.api.model.Submodule;
import com.duoit.api.model.Word;
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

	public TermsService(SubmoduleRepository submodules, WordRepository words, CardRepository cards) {
		this.submodules = submodules;
		this.words = words;
		this.cards = cards;
	}

	@Transactional(readOnly = true)
	public Optional<TermsResponse> terms(String slug) {
		return submodules.findBySlug(slug).map(submodule -> new TermsResponse(
				submodule.isCompleted(),
				words.findBySubmoduleSlugOrderByIdAsc(slug).stream().map(TermView::from).toList()));
	}

	/** Conclui o grupo e inclui suas palavras no Review. Retorna false se o grupo não existir. */
	@Transactional
	public boolean complete(String slug, Instant now) {
		Optional<Submodule> found = submodules.findBySlug(slug);
		if (found.isEmpty()) {
			return false;
		}
		Submodule submodule = found.get();
		submodule.complete(now);
		for (Word word : words.findBySubmoduleSlugOrderByIdAsc(slug)) {
			if (cards.findByWord(word).isEmpty()) {
				cards.save(new Card(word, now));
			}
		}
		return true;
	}

	public record TermsResponse(boolean completed, List<TermView> terms) {
	}

	public record TermView(Long id, String term, String meaning, String example) {

		static TermView from(Word word) {
			return new TermView(word.getId(), word.getTerm(), word.getMeaning(), word.getExample());
		}
	}
}
