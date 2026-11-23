package com.duoit.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duoit.api.model.Submodule;

public interface SubmoduleRepository extends JpaRepository<Submodule, Long> {

	Optional<Submodule> findBySlug(String slug);
}
