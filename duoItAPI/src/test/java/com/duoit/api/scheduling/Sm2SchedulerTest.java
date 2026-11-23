package com.duoit.api.scheduling;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.duoit.api.model.Rating;
import com.duoit.api.scheduling.Sm2Scheduler.State;

class Sm2SchedulerTest {

	private static final LocalDate TODAY = LocalDate.of(2026, 11, 9);

	@Test
	void goodSequenceFollowsSm2Intervals() {
		State s = State.initial();

		Sm2Scheduler.Outcome first = Sm2Scheduler.review(s, Rating.GOOD, TODAY);
		assertThat(first.state().intervalDays()).isEqualTo(1);

		Sm2Scheduler.Outcome second = Sm2Scheduler.review(first.state(), Rating.GOOD, TODAY);
		assertThat(second.state().intervalDays()).isEqualTo(6);

		Sm2Scheduler.Outcome third = Sm2Scheduler.review(second.state(), Rating.GOOD, TODAY);
		assertThat(third.state().intervalDays()).isEqualTo(15);
		assertThat(third.dueDate()).isEqualTo(TODAY.plusDays(15));
	}

	@Test
	void againResetsRepetitionsAndCountsLapse() {
		State mature = new State(4, 2.5, 30, 0);

		Sm2Scheduler.Outcome outcome = Sm2Scheduler.review(mature, Rating.AGAIN, TODAY);

		assertThat(outcome.state().repetitions()).isZero();
		assertThat(outcome.state().lapses()).isEqualTo(1);
		assertThat(outcome.state().intervalDays()).isEqualTo(1);
		assertThat(outcome.state().ease()).isCloseTo(2.3, org.assertj.core.data.Offset.offset(0.0001));
	}

	@Test
	void easeNeverDropsBelowMinimum() {
		State s = new State(3, Sm2Scheduler.MIN_EASE, 10, 0);

		Sm2Scheduler.Outcome outcome = Sm2Scheduler.review(s, Rating.AGAIN, TODAY);

		assertThat(outcome.state().ease()).isEqualTo(Sm2Scheduler.MIN_EASE);
	}

	@Test
	void easyGivesLongerIntervalThanGood() {
		State s = new State(2, 2.5, 6, 0);

		int good = Sm2Scheduler.previewDays(s, Rating.GOOD, TODAY);
		int easy = Sm2Scheduler.previewDays(s, Rating.EASY, TODAY);

		assertThat(easy).isGreaterThan(good);
	}

	@Test
	void hardGrowsSlowerThanGoodAndLowersEase() {
		State s = new State(3, 2.5, 10, 0);

		Sm2Scheduler.Outcome hard = Sm2Scheduler.review(s, Rating.HARD, TODAY);
		int good = Sm2Scheduler.previewDays(s, Rating.GOOD, TODAY);

		assertThat(hard.state().intervalDays()).isLessThan(good);
		assertThat(hard.state().ease()).isLessThan(2.5);
	}
}
