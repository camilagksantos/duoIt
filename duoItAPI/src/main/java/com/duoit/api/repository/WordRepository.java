package com.duoit.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duoit.api.model.Submodule;
import com.duoit.api.model.Word;

public interface WordRepository extends JpaRepository<Word, Long> {

	Optional<Word> findBySubmoduleAndTerm(Submodule submodule, String term);

	List<Word> findBySubmoduleSlugOrderByIdAsc(String slug);
}
