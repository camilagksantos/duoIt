package com.duoit.api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.duoit.api.model.Card;
import com.duoit.api.model.CardState;

public interface CardRepository extends JpaRepository<Card, Long> {

	@Query("""
			select c from Card c
			join c.word w
			join w.submodule s
			where c.state = :state and c.dueDate <= :today and s.slug = :slug
			order by c.dueDate
			""")
	List<Card> findDueInSubmodule(@Param("state") CardState state, @Param("today") LocalDate today,
			@Param("slug") String slug);

	@Query("""
			select c from Card c
			join c.word w
			join w.submodule s
			where c.state = :state and s.slug = :slug
			order by w.id
			""")
	List<Card> findNewInSubmodule(@Param("state") CardState state, @Param("slug") String slug, Pageable pageable);

	long countByIntroducedOn(LocalDate day);

	@Query("""
			select s.slug as slug, count(c) as total,
			       sum(case when c.state = :answered then 1 else 0 end) as answered,
			       sum(case when c.state = :answered and c.intervalDays >= :masteredDays then 1 else 0 end) as mastered
			from Card c
			join c.word w
			join w.submodule s
			group by s.slug
			""")
	List<SubmoduleProgressRow> progressBySubmodule(@Param("answered") CardState answered,
			@Param("masteredDays") int masteredDays);
}
