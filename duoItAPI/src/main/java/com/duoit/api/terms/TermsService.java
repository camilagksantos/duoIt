package com.duoit.api.terms;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.model.Card;
import com.duoit.api.model.Word;
import com.duoit.api.repository.CardRepository;
import com.duoit.api.repository.WordRepository;

/** Termos de um grupo e o checkbox "aprendi". Marcar cria o card; desmarcar só pausa. */
@Service
public class TermsService {

	private final WordRepository words;
	private final CardRepository cards;

	public TermsService(WordRepository words, CardRepository cards) {
		this.words = words;
		this.cards = cards;
	}

	@Transactional(readOnly = true)
	public List<TermView> terms(String slug) {
		return words.findBySubmoduleSlugOrderByIdAsc(slug).stream()
				.map(word -> TermView.from(word, learned(word)))
				.toList();
	}

	/** Retorna false se a palavra não existir. */
	@Transactional
	public boolean setLearned(Long wordId, boolean learned, Instant now) {
		Optional<Word> word = words.findById(wordId);
		if (word.isEmpty()) {
			return false;
		}
		Optional<Card> card = cards.findByWord(word.get());
		if (learned) {
			if (card.isPresent()) {
				card.get().resume();
			} else {
				cards.save(new Card(word.get(), now));
			}
		} else {
			card.ifPresent(Card::pause);
		}
		return true;
	}

	private boolean learned(Word word) {
		return cards.findByWord(word).map(c -> !c.isPaused()).orElse(false);
	}

	public record TermView(Long id, String term, String meaning, String example, boolean learned) {

		static TermView from(Word word, boolean learned) {
			return new TermView(word.getId(), word.getTerm(), word.getMeaning(), word.getExample(), learned);
		}
	}
}
