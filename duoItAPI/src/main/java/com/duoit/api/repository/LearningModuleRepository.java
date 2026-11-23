package com.duoit.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duoit.api.model.LearningModule;

public interface LearningModuleRepository extends JpaRepository<LearningModule, Long> {

	Optional<LearningModule> findByTitle(String title);
}
