package com.duoit.api.review;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.duoit.api.study.CardView;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

	private final ReviewSessionService sessions;

	public ReviewController(ReviewSessionService sessions) {
		this.sessions = sessions;
	}

	@GetMapping("/session")
	public List<CardView> session() {
		return sessions.sessionViews(Instant.now(), LocalDate.now());
	}
}
