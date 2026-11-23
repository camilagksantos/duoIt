package com.duoit.api.study;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.duoit.api.model.Card;
import com.duoit.api.repository.CardRepository;
import com.duoit.api.repository.WordRepository;

/** Cria o card de toda palavra que ainda não tem um. Chamado antes de sessões e de consultas de progresso. */
@Component
public class CardProvisioner {

	private final CardRepository cards;
	private final WordRepository words;

	public CardProvisioner(CardRepository cards, WordRepository words) {
		this.cards = cards;
		this.words = words;
	}

	@Transactional
	public void ensureCards() {
		words.findWithoutCard().forEach(word -> cards.save(new Card(word)));
	}
}
