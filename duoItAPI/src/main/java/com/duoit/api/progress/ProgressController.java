package com.duoit.api.progress;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

	private final ProgressService progress;

	public ProgressController(ProgressService progress) {
		this.progress = progress;
	}

	@GetMapping
	public List<SubmoduleProgress> progress() {
		return progress.bySubmodule();
	}
}
