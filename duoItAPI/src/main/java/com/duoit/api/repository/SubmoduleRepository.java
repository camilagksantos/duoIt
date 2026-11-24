package com.duoit.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.duoit.api.model.Submodule;

public interface SubmoduleRepository extends JpaRepository<Submodule, Long> {

	Optional<Submodule> findBySlug(String slug);

	/** Todos os grupos na ordem de estudo: módulo, depois posição no módulo. */
	List<Submodule> findAllByOrderByModulePositionAscPositionAsc();
}
