package com.duoit.api.scheduling;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.Test;

import com.duoit.api.model.CardState;
import com.duoit.api.model.Rating;
import com.duoit.api.scheduling.FsrsScheduler.Memory;

class FsrsSchedulerTest {

	private static final Instant NOW = Instant.parse("2026-11-23T12:00:00Z");

	@Test
	void intervalAtNinetyPercentRetentionEqualsStability() {
		assertThat(Fsrs.intervalDays(10)).isEqualTo(10);
		assertThat(Fsrs.intervalDays(30)).isEqualTo(30);
	}

	@Test
	void intervalIsAtLeastOneDay() {
		assertThat(Fsrs.intervalDays(0.1)).isEqualTo(1);
	}

	@Test
	void newCardGoodEntersLearningStepTenMinutes() {
		Memory next = FsrsScheduler.review(Memory.newCard(NOW), Rating.GOOD, NOW);

		assertThat(next.state()).isEqualTo(CardState.LEARNING);
		assertThat(next.step()).isEqualTo(1);
		assertThat(Duration.between(NOW, next.dueAt())).isEqualTo(Duration.ofMinutes(10));
	}

	@Test
	void goodAtLastLearningStepGraduatesToReview() {
		Memory inStep = FsrsScheduler.review(Memory.newCard(NOW), Rating.GOOD, NOW);
		Memory graduated = FsrsScheduler.review(inStep, Rating.GOOD, NOW.plus(Duration.ofMinutes(10)));

		assertThat(graduated.state()).isEqualTo(CardState.REVIEW);
		assertThat(Duration.between(NOW, graduated.dueAt()).toDays()).isGreaterThanOrEqualTo(1);
	}

	@Test
	void easyOnNewCardGraduatesImmediately() {
		Memory next = FsrsScheduler.review(Memory.newCard(NOW), Rating.EASY, NOW);

		assertThat(next.state()).isEqualTo(CardState.REVIEW);
		assertThat(next.reps()).isEqualTo(1);
	}

	@Test
	void againInLearningStaysInLearningWithOneMinute() {
		Memory next = FsrsScheduler.review(Memory.newCard(NOW), Rating.AGAIN, NOW);

		assertThat(next.state()).isEqualTo(CardState.LEARNING);
		assertThat(Duration.between(NOW, next.dueAt())).isEqualTo(Duration.ofMinutes(1));
	}

	@Test
	void againOnReviewedCardMovesToRelearningAndCountsLapse() {
		Instant reviewedAt = NOW.minus(Duration.ofDays(10));
		Memory review = new Memory(CardState.REVIEW, 0, 10, 5, 3, 0, reviewedAt, NOW);

		Memory next = FsrsScheduler.review(review, Rating.AGAIN, NOW);

		assertThat(next.state()).isEqualTo(CardState.RELEARNING);
		assertThat(next.lapses()).isEqualTo(1);
		assertThat(Duration.between(NOW, next.dueAt())).isEqualTo(Duration.ofMinutes(10));
		assertThat(next.stability()).isLessThanOrEqualTo(10);
	}

	@Test
	void goodOnReviewedCardIncreasesStabilityAndSchedulesDays() {
		Instant reviewedAt = NOW.minus(Duration.ofDays(10));
		Memory review = new Memory(CardState.REVIEW, 0, 10, 5, 3, 0, reviewedAt, NOW);

		Memory next = FsrsScheduler.review(review, Rating.GOOD, NOW);

		assertThat(next.state()).isEqualTo(CardState.REVIEW);
		assertThat(next.stability()).isGreaterThan(10);
		assertThat(Duration.between(NOW, next.dueAt()).toDays()).isGreaterThanOrEqualTo(1);
	}

	@Test
	void easyGivesLongerIntervalThanGoodOnReviewedCard() {
		Instant reviewedAt = NOW.minus(Duration.ofDays(10));
		Memory review = new Memory(CardState.REVIEW, 0, 10, 5, 3, 0, reviewedAt, NOW);

		long good = FsrsScheduler.minutesUntilDue(review, Rating.GOOD, NOW);
		long easy = FsrsScheduler.minutesUntilDue(review, Rating.EASY, NOW);

		assertThat(easy).isGreaterThan(good);
	}

	@Test
	void difficultyStaysWithinBounds() {
		assertThat(Fsrs.initialDifficulty(1)).isBetween(1.0, 10.0);
		assertThat(Fsrs.initialDifficulty(4)).isBetween(1.0, 10.0);
		double d = 9.9;
		for (int i = 0; i < 20; i++) {
			d = Fsrs.nextDifficulty(d, 1);
		}
		assertThat(d).isBetween(1.0, 10.0);
	}
}
