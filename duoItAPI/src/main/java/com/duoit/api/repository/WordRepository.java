package com.duoit.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.duoit.api.model.Submodule;
import com.duoit.api.model.Word;

public interface WordRepository extends JpaRepository<Word, Long> {

	@Query("select w from Word w where not exists (select c.id from Card c where c.word = w)")
	List<Word> findWithoutCard();

	Optional<Word> findBySubmoduleAndTerm(Submodule submodule, String term);
}
