package com.duoit.api.repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.duoit.api.model.Card;
import com.duoit.api.model.CardState;
import com.duoit.api.model.Word;

public interface CardRepository extends JpaRepository<Card, Long> {

	Optional<Card> findByWord(Word word);

	/** Cards já avaliados pelo menos uma vez, com vencimento até {@code now}. */
	@Query("""
			select c from Card c
			join fetch c.word w
			join fetch w.submodule s
			join fetch s.module
			where c.state <> :newState and c.dueAt <= :now
			order by c.dueAt
			""")
	List<Card> findDue(@Param("newState") CardState newState, @Param("now") Instant now);

	/** Cards ainda não avaliados, na ordem das palavras. */
	@Query("""
			select c from Card c
			join fetch c.word w
			join fetch w.submodule s
			join fetch s.module
			where c.state = :newState
			order by w.id
			""")
	List<Card> findNew(@Param("newState") CardState newState);

	/** Todos os cards marcados, sem filtro de data, na ordem das palavras. */
	@Query("""
			select c from Card c
			join fetch c.word w
			join fetch w.submodule s
			join fetch s.module
			order by w.id
			""")
	List<Card> findAllCards();

	long countByIntroducedOn(LocalDate day);

	@Query("""
			select s.slug as slug, count(c) as total,
			       sum(case when c.exerciseAnsweredAt is not null then 1 else 0 end) as answered,
			       sum(case when c.exerciseCorrect = true then 1 else 0 end) as correct,
			       s.completedAt as completedAt
			from Card c
			join c.word w
			join w.submodule s
			group by s.slug, s.completedAt
			""")
	List<SubmoduleProgressRow> progressBySubmodule();
}
