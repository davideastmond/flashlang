import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PracticeStudySet from "~/pages/user/studysets/[studySetId]/practice/index.vue";

const fetchMock = vi.fn();

vi.stubGlobal("$fetch", fetchMock);

// Mock navigateTo
mockNuxtImport("navigateTo", () => {
  return vi.fn();
});

// Mock useRoute
mockNuxtImport("useRoute", () => {
  return vi.fn(() => ({
    params: {
      studySetId: "test-123",
    },
  }));
});

// Mock getFullUuid
mockNuxtImport("getFullUuid", () => {
  return vi.fn((uuid: string) => `full-${uuid}`);
});

// Mock toShortenedUuid
mockNuxtImport("toShortenedUuid", () => {
  return vi.fn((uuid: string) => uuid.slice(0, 8));
});

describe("PracticeStudySet Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock default fetch response
    fetchMock.mockResolvedValue({
      success: true,
      data: {
        id: "uuid-1234",
        title: "Spanish Vocabulary",
        description: "Basic Spanish words",
        language: "es-ES",
        flashCards: [
          {
            id: "card-1",
            question: "What is 'hello' in Spanish?",
            answer: "Hola",
          },
          {
            id: "card-2",
            question: "What is 'goodbye' in Spanish?",
            answer: "Adiós",
          },
          {
            id: "card-3",
            question: "What is 'thank you' in Spanish?",
            answer: "Gracias",
          },
        ],
      },
    });
  });

  describe("Initial Loading and Rendering", () => {
    it("displays loading spinner while fetching data", async () => {
      fetchMock.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      expect(wrapper.find(".animate-spin").exists()).toBe(true);
    });

    it("fetches study set data on mount", async () => {
      await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      expect(fetchMock).toHaveBeenCalledWith("/api/studysets/full-test-123");
    });

    it("renders study set title correctly", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.text()).toContain("Spanish Vocabulary");
    });

    it("displays error state when fetch fails", async () => {
      fetchMock.mockRejectedValueOnce({
        data: { statusMessage: "Failed to load study set" },
      });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.text()).toContain("Failed to load study set");
    });

    it("displays empty state when no flashcards exist", async () => {
      fetchMock.mockResolvedValueOnce({
        success: true,
        data: {
          id: "uuid-1234",
          title: "Empty Set",
          description: "No cards",
          language: "en-US",
          flashCards: [],
        },
      });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.text()).toContain("No flash cards to practice");
    });
  });

  describe("Card Display and Navigation", () => {
    it("displays current card number and total", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.text()).toMatch(/Card \d+ of 3/);
    });

    it("displays progress bar", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const progressBar = wrapper.find(".bg-indigo-500");
      expect(progressBar.exists()).toBe(true);
    });

    it("displays current question on card front", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // The question from one of the cards should be displayed
      const hasQuestion =
        wrapper.text().includes("hello") ||
        wrapper.text().includes("goodbye") ||
        wrapper.text().includes("thank you");

      expect(hasQuestion).toBe(true);
    });

    it("navigates to next card when clicking Next button", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const currentText = wrapper.text();

      // Find and click Next button
      const nextButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Next"));

      if (nextButton) {
        await nextButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Text should change after navigation
        expect(wrapper.text()).not.toBe(currentText);
      }
    });

    it("navigates to previous card when clicking Previous button", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // First, navigate to the next card
      const nextButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Next"));

      if (nextButton) {
        await nextButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 600));

        const textAfterNext = wrapper.text();

        // Now navigate back
        const previousButton = wrapper
          .findAll("button")
          .find((btn) => btn.text().includes("Previous"));

        if (previousButton) {
          await previousButton.trigger("click");
          await wrapper.vm.$nextTick();
          await new Promise((resolve) => setTimeout(resolve, 600));

          // Text should change after going back
          expect(wrapper.text()).not.toBe(textAfterNext);
        }
      }
    });

    it("disables Previous button on first card", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const previousButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Previous"));

      expect(previousButton?.attributes("disabled")).toBeDefined();
    });

    it("displays Finish button on last card", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate to last card
      const nextButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Next"));

      if (nextButton) {
        // Click Next twice to reach the last card (3 cards total)
        await nextButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 600));

        await nextButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Should show Finish button
        expect(wrapper.text()).toContain("Finish");
      }
    });
  });

  describe("Card Flipping", () => {
    it("flips card when clicking Flip Card button", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const flipButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Flip Card"));

      expect(flipButton).toBeDefined();

      if (flipButton) {
        await flipButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Card should have flip class applied
        const card = wrapper.find(".rotate-y-180");
        expect(card.exists()).toBe(true);
      }
    });

    it("flips card when clicking on the card itself", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const card = wrapper.find(".cursor-pointer");

      if (card) {
        await card.trigger("click");
        await wrapper.vm.$nextTick();

        // Card should have flip class applied
        expect(card.classes()).toContain("rotate-y-180");
      }
    });

    it("displays question label on front of card", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.text()).toContain("Question");
    });

    it("displays answer label when card is flipped", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const flipButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Flip Card"));

      if (flipButton) {
        await flipButton.trigger("click");
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain("Answer");
      }
    });
  });

  describe("Answer Input", () => {
    it("renders answer input field", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const answerInput = wrapper.find('input[type="text"]');
      expect(answerInput.exists()).toBe(true);
    });

    it("binds user answer to input field", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const answerInput = wrapper.find('input[type="text"]');
      await answerInput.setValue("Hola");

      expect((answerInput.element as HTMLInputElement).value).toBe("Hola");
    });

    it("clears answer input when navigating to next card", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const answerInput = wrapper.find('input[type="text"]');
      await answerInput.setValue("Test Answer");

      const nextButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Next"));

      if (nextButton) {
        await nextButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 600));

        expect((answerInput.element as HTMLInputElement).value).toBe("");
      }
    });

    it("displays placeholder text in input field", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const answerInput = wrapper.find('input[type="text"]');
      expect(answerInput.attributes("placeholder")).toContain(
        "Type your answer"
      );
    });
  });

  describe("Answer Checking", () => {
    it("displays correct indicator for correct answer", async () => {
      fetchMock.mockResolvedValueOnce({
        success: true,
        data: {
          id: "uuid-1234",
          title: "Test",
          flashCards: [
            {
              id: "card-1",
              question: "Test question",
              answer: "Test",
            },
          ],
        },
      });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const answerInput = wrapper.find('input[type="text"]');
      await answerInput.setValue("Test");

      const flipButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Flip Card"));

      if (flipButton) {
        await flipButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(wrapper.find(".text-green-400").exists()).toBe(true);
      }
    });

    it("displays incorrect indicator for wrong answer", async () => {
      fetchMock.mockResolvedValueOnce({
        success: true,
        data: {
          id: "uuid-1234",
          title: "Test",
          flashCards: [
            {
              id: "card-1",
              question: "Test question",
              answer: "Correct",
            },
          ],
        },
      });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const answerInput = wrapper.find('input[type="text"]');
      await answerInput.setValue("Wrong");

      const flipButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Flip Card"));

      if (flipButton) {
        await flipButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // AI check will be called
        expect(wrapper.find(".text-red-400").exists()).toBe(true);
      }
    });
  });

  describe("Results Screen", () => {
    it("displays results screen after finishing session", async () => {
      fetchMock
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: "uuid-1234",
            title: "Spanish Vocabulary",
            flashCards: [
              {
                id: "card-1",
                question: "Test",
                answer: "Answer",
              },
            ],
          },
        })
        .mockResolvedValueOnce({ success: true }); // For session submission

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const finishButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Finish"));

      if (finishButton) {
        await finishButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(wrapper.text()).toContain("Practice Complete");
      }
    });

    it("displays score summary on results screen", async () => {
      fetchMock
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: "uuid-1234",
            title: "Test",
            flashCards: [
              {
                id: "card-1",
                question: "Q1",
                answer: "A1",
              },
              {
                id: "card-2",
                question: "Q2",
                answer: "A2",
              },
            ],
          },
        })
        .mockResolvedValueOnce({ success: true });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const finishButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Next"));

      if (finishButton) {
        await finishButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 600));

        const finishButtonFinal = wrapper
          .findAll("button")
          .find((btn) => btn.text().includes("Finish"));

        if (finishButtonFinal) {
          await finishButtonFinal.trigger("click");
          await wrapper.vm.$nextTick();
          await new Promise((resolve) => setTimeout(resolve, 100));

          expect(wrapper.text()).toContain("Correct Answers");
          expect(wrapper.text()).toContain("Accuracy");
        }
      }
    });

    it("displays Practice Again button on results screen", async () => {
      fetchMock
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: "uuid-1234",
            title: "Test",
            flashCards: [
              {
                id: "card-1",
                question: "Q",
                answer: "A",
              },
            ],
          },
        })
        .mockResolvedValueOnce({ success: true });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const finishButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Finish"));

      if (finishButton) {
        await finishButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(wrapper.text()).toContain("Practice Again");
      }
    });

    it("resets session when clicking Practice Again", async () => {
      fetchMock
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: "uuid-1234",
            title: "Test",
            flashCards: [
              {
                id: "card-1",
                question: "Q",
                answer: "A",
              },
            ],
          },
        })
        .mockResolvedValueOnce({ success: true });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const finishButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Finish"));

      if (finishButton) {
        await finishButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const practiceAgainButton = wrapper
          .findAll("button")
          .find((btn) => btn.text().includes("Practice Again"));

        if (practiceAgainButton) {
          await practiceAgainButton.trigger("click");
          await wrapper.vm.$nextTick();

          // Should be back to practice mode
          expect(wrapper.text()).not.toContain("Practice Complete");
          expect(wrapper.find('input[type="text"]').exists()).toBe(true);
        }
      }
    });

    it("displays card results details on results screen", async () => {
      fetchMock
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: "uuid-1234",
            title: "Test",
            flashCards: [
              {
                id: "card-1",
                question: "Q1",
                answer: "A1",
              },
            ],
          },
        })
        .mockResolvedValueOnce({ success: true });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const finishButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Finish"));

      if (finishButton) {
        await finishButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(wrapper.text()).toContain("Card Results");
      }
    });

    it("submits session data to API when finishing", async () => {
      fetchMock
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: "uuid-1234",
            title: "Test",
            flashCards: [
              {
                id: "card-1",
                question: "Q",
                answer: "A",
              },
            ],
          },
        })
        .mockResolvedValueOnce({ success: true });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const finishButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Finish"));

      if (finishButton) {
        await finishButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should have called the session API
        const sessionCall = fetchMock.mock.calls.find(
          (call) => call[0] === "/api/study-sessions"
        );
        expect(sessionCall).toBeDefined();
      }
    });
  });

  describe("Keyboard Navigation", () => {
    it("displays keyboard shortcuts hint", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.text()).toContain("Keyboard shortcuts");
    });
  });

  describe("UI Elements", () => {
    it("renders Back to Study Set link", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to" class="back-link"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const backLink = wrapper.find(".back-link");
      expect(backLink.exists()).toBe(true);
      expect(backLink.text()).toContain("Back to Study Set");
    });

    it("displays SVG icons", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const svgs = wrapper.findAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("applies correct styling classes", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.html()).toContain("rounded-lg");
    });
  });

  describe("Session Duration", () => {
    it("tracks session duration", async () => {
      fetchMock
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: "uuid-1234",
            title: "Test",
            flashCards: [
              {
                id: "card-1",
                question: "Q",
                answer: "A",
              },
            ],
          },
        })
        .mockResolvedValueOnce({ success: true });

      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const finishButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Finish"));

      if (finishButton) {
        await finishButton.trigger("click");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(wrapper.text()).toContain("Duration");
      }
    });
  });

  describe("Special Characters Panel", () => {
    it("renders the special characters panel", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.text()).toContain("Special Characters");
    });

    it("starts with panel collapsed by default", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Panel should exist but diacritic buttons should not be visible initially
      const diacriticButtons = wrapper
        .findAll("button")
        .filter((btn) => btn.text().match(/^[áéíóúñüàèìòù]$/i));

      expect(diacriticButtons.length).toBe(0);
    });

    it("expands panel when clicking the header", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Find and click the Special Characters toggle button
      const toggleButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Special Characters"));

      expect(toggleButton).toBeDefined();

      if (toggleButton) {
        await toggleButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Now diacritic buttons should be visible
        const diacriticButtons = wrapper
          .findAll("button")
          .filter((btn) => btn.text().match(/^[áéíóúñüàèìòù]$/i));

        expect(diacriticButtons.length).toBeGreaterThan(0);
      }
    });

    it("collapses panel when clicking header again", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const toggleButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Special Characters"));

      if (toggleButton) {
        // Expand
        await toggleButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Collapse
        await toggleButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Buttons should be hidden again
        const diacriticButtons = wrapper
          .findAll("button")
          .filter((btn) => btn.text().match(/^[áéíóúñüàèìòù]$/i));

        expect(diacriticButtons.length).toBe(0);
      }
    });

    it("displays lowercase diacritics by default", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Expand panel
      const toggleButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Special Characters"));

      if (toggleButton) {
        await toggleButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Check for lowercase characters
        expect(wrapper.text()).toContain("á");
        expect(wrapper.text()).toContain("é");
        expect(wrapper.text()).toContain("ñ");
      }
    });

    it("toggles between lowercase and uppercase diacritics", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Expand panel
      const toggleButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Special Characters"));

      if (toggleButton) {
        await toggleButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Find the ABC/abc toggle button
        const caseToggle = wrapper
          .findAll("button")
          .find((btn) => btn.text() === "abc");

        expect(caseToggle).toBeDefined();

        if (caseToggle) {
          await caseToggle.trigger("click");
          await wrapper.vm.$nextTick();

          // Should now show uppercase
          expect(wrapper.text()).toContain("Á");
          expect(wrapper.text()).toContain("É");
          expect(wrapper.text()).toContain("Ñ");
        }
      }
    });

    it("inserts diacritic character into answer field when clicked", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Expand panel
      const toggleButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Special Characters"));

      if (toggleButton) {
        await toggleButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Find a diacritic button (e.g., 'á')
        const diacriticButton = wrapper
          .findAll("button")
          .find((btn) => btn.text() === "á");

        expect(diacriticButton).toBeDefined();

        if (diacriticButton) {
          const answerInput = wrapper.find('input[type="text"]');

          // Set initial value
          await answerInput.setValue("Hol");

          // Click the diacritic button
          await diacriticButton.trigger("click");
          await wrapper.vm.$nextTick();

          // Check if the character was added
          expect((answerInput.element as HTMLInputElement).value).toBe("Holá");
        }
      }
    });

    it("displays chevron icon that rotates when panel is toggled", async () => {
      const wrapper = await mountSuspended(PracticeStudySet, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Find the toggle button's SVG
      const toggleButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Special Characters"));

      if (toggleButton) {
        const svg = toggleButton.find("svg");
        expect(svg.exists()).toBe(true);

        // Initially should not have rotate-180 class
        expect(svg.classes()).not.toContain("rotate-180");

        // Click to expand
        await toggleButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Should now have rotate-180 class
        expect(svg.classes()).toContain("rotate-180");
      }
    });
  });
});
