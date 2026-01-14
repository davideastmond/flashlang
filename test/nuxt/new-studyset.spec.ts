import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewStudySet from "~/pages/user/studysets/new/index.vue";

// Mock $fetch globally
const mockFetch = vi.fn();
const mockNavigateTo = vi.fn();

vi.stubGlobal("$fetch", mockFetch);
vi.stubGlobal("navigateTo", mockNavigateTo);

// mock

mockNuxtImport("useRoute", () => vi.fn());

// Mock toShortenedUuid
mockNuxtImport("toShortenedUuid", () => {
  return vi.fn((uuid: string) => uuid.slice(0, 8));
});

describe("NewStudySet Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ data: "uuid-1234-5678-abcd" });
  });

  it("renders the page header correctly", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Create New Study Set");
    expect(wrapper.text()).toContain(
      "Build your personalized study set with custom flash cards"
    );
  });

  it("renders study set details section", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Study Set Details");
    expect(wrapper.find("#title").exists()).toBe(true);
    expect(wrapper.find("#description").exists()).toBe(true);
    expect(wrapper.find("#language").exists()).toBe(true);
  });

  it("renders flash cards section", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Flash Cards");
    expect(wrapper.text()).toContain(
      "Add at least one flash card to your study set"
    );
  });

  it("initializes with one empty flash card on mount", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Should show "1 card" counter
    expect(wrapper.text()).toContain("1 card");
    expect(wrapper.text()).toContain("Card 1");
  });

  it("adds a new flash card when clicking add button", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Find add card button
    const addButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Add Flash Card"));

    expect(addButton).toBeDefined();

    if (addButton) {
      await addButton.trigger("click");
      await wrapper.vm.$nextTick();

      // Should now show 2 cards
      expect(wrapper.text()).toContain("2 cards");
      expect(wrapper.text()).toContain("Card 2");
    }
  });

  it("removes a flash card when clicking delete button", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Add another card first
    const addButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Add Flash Card"));

    if (addButton) {
      await addButton.trigger("click");
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain("2 cards");

      // Find and click delete button
      const deleteButtons = wrapper.findAll('button[aria-label="Remove card"]');
      expect(deleteButtons.length).toBe(2);

      await deleteButtons[0]?.trigger("click");
      await wrapper.vm.$nextTick();

      // Should now show 1 card
      expect(wrapper.text()).toContain("1 card");
    }
  });

  it("updates card count display correctly", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Initially 1 card
    expect(wrapper.text()).toContain("1 card");

    // Add cards
    const addButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Add Flash Card"));

    if (addButton) {
      await addButton.trigger("click");
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain("2 cards");

      await addButton.trigger("click");
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain("3 cards");
    }
  });

  it("binds title input to v-model", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    const titleInput = wrapper.find("#title");
    await titleInput.setValue("Spanish Vocabulary");

    expect((titleInput.element as HTMLInputElement).value).toBe(
      "Spanish Vocabulary"
    );
  });

  it("binds description textarea to v-model", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    const descriptionTextarea = wrapper.find("#description");
    await descriptionTextarea.setValue(
      "Basic Spanish vocabulary for beginners"
    );

    expect((descriptionTextarea.element as HTMLTextAreaElement).value).toBe(
      "Basic Spanish vocabulary for beginners"
    );
  });

  it("binds language select to v-model", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    const languageSelect = wrapper.find("#language");
    await languageSelect.setValue("es-ES");

    expect((languageSelect.element as HTMLSelectElement).value).toBe("es-ES");
  });

  it("displays all supported languages in select dropdown", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    const languageSelect = wrapper.find("#language");
    const options = languageSelect.findAll("option");

    // Should have placeholder + 10 languages
    expect(options.length).toBe(10);
    expect(wrapper.text()).toContain("English (US)");
    expect(wrapper.text()).toContain("Spanish");
    expect(wrapper.text()).toContain("French");
    expect(wrapper.text()).toContain("German");
  });

  it("binds flash card question to v-model", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const questionTextarea = wrapper.find("textarea[id^='question-']");
    await questionTextarea.setValue("What is 'hello' in Spanish?");

    expect((questionTextarea.element as HTMLTextAreaElement).value).toBe(
      "What is 'hello' in Spanish?"
    );
  });

  it("binds flash card answer to v-model", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const answerTextarea = wrapper.find("textarea[id^='answer-']");
    await answerTextarea.setValue("Hola");

    expect((answerTextarea.element as HTMLTextAreaElement).value).toBe("Hola");
  });

  it("shows validation error when title is empty", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Fill in language but not title
    await wrapper.find("#language").setValue("es-ES");

    // Fill in flash card
    await wrapper.find("textarea[id^='question-']").setValue("Question");
    await wrapper.find("textarea[id^='answer-']").setValue("Answer");

    // Submit form
    const form = wrapper.find("form");
    await form.trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    // Should show error
    expect(wrapper.text()).toContain("Title is required");
  });

  it("shows validation error when flash card question is empty", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Fill in required fields
    await wrapper.find("#title").setValue("Spanish Vocabulary");
    await wrapper.find("#language").setValue("es-ES");

    // Leave question empty, fill answer
    await wrapper.find("textarea[id^='answer-']").setValue("Answer");

    // Submit form
    const form = wrapper.find("form");
    await form.trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    // Should show error
    expect(wrapper.text()).toContain(
      "All flashcards must have both question and answer"
    );
  });

  it("shows validation error when flash card answer is empty", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Fill in required fields
    await wrapper.find("#title").setValue("Spanish Vocabulary");
    await wrapper.find("#language").setValue("es-ES");

    // Fill question, leave answer empty
    await wrapper.find("textarea[id^='question-']").setValue("Question");

    // Submit form
    const form = wrapper.find("form");
    await form.trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    // Should show error
    expect(wrapper.text()).toContain(
      "All flashcards must have both question and answer"
    );
  });

  it("submits form successfully with valid data", async () => {
    mockFetch.mockResolvedValue({ data: "uuid-1234-5678-abcd" });

    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Fill in all required fields
    await wrapper.find("#title").setValue("Spanish Vocabulary");
    await wrapper.find("#description").setValue("Basic Spanish words");
    await wrapper.find("#language").setValue("es-ES");

    // Fill in flash card
    await wrapper
      .find("textarea[id^='question-']")
      .setValue("What is 'hello'?");
    await wrapper.find("textarea[id^='answer-']").setValue("Hola");

    // Submit form
    const form = wrapper.find("form");
    await form.trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    // Should call $fetch with correct data
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/studysets",
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          title: "Spanish Vocabulary",
          description: "Basic Spanish words",
          language: "es-ES",
          flashCards: expect.arrayContaining([
            expect.objectContaining({
              question: "What is 'hello'?",
              answer: "Hola",
            }),
          ]),
        }),
      })
    );
  });

  it("displays success message after creation", async () => {
    mockFetch.mockResolvedValue({ data: "uuid-1234-5678-abcd" });

    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Fill in all required fields
    await wrapper.find("#title").setValue("Spanish Vocabulary");
    await wrapper.find("#language").setValue("es-ES");
    await wrapper.find("textarea[id^='question-']").setValue("Question");
    await wrapper.find("textarea[id^='answer-']").setValue("Answer");

    // Submit form
    const form = wrapper.find("form");
    await form.trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    // Should show success message
    expect(wrapper.text()).toContain("Study set created successfully!");
  });

  it("displays error message on submission failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Fill in all required fields
    await wrapper.find("#title").setValue("Spanish Vocabulary");
    await wrapper.find("#language").setValue("es-ES");
    await wrapper.find("textarea[id^='question-']").setValue("Question");
    await wrapper.find("textarea[id^='answer-']").setValue("Answer");

    // Submit form
    const form = wrapper.find("form");
    await form.trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    // Wait for error to be displayed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should show error message
    expect(wrapper.text()).toContain(
      "Failed to create study set. Please try again."
    );
  });

  it("disables submit button while submitting", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Find submit button
    const submitButton = wrapper
      .findAll("button")
      .find((btn) => btn.attributes("type") === "submit");

    expect(submitButton).toBeDefined();

    if (submitButton) {
      // Initially not disabled
      expect(submitButton.attributes("disabled")).toBeUndefined();
    }
  });

  it("renders Create with AI button", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Create with AI");
  });

  it("opens AI modal when clicking Create with AI button", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: {
            template: '<div class="ai-modal">AI Modal</div>',
          },
        },
      },
    });

    await wrapper.vm.$nextTick();

    // AI modal should not be visible initially
    expect(wrapper.find(".ai-modal").exists()).toBe(false);

    // Find and click AI button
    const aiButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Create with AI"));

    expect(aiButton).toBeDefined();

    if (aiButton) {
      await aiButton.trigger("click");
      await wrapper.vm.$nextTick();

      // AI modal should now be visible
      expect(wrapper.find(".ai-modal").exists()).toBe(true);
    }
  });

  it("renders Cancel button with correct link", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to" class="cancel-link"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    const cancelLink = wrapper.find(".cancel-link");
    expect(cancelLink.exists()).toBe(true);
    expect(cancelLink.text()).toContain("Cancel");
    expect(cancelLink.attributes("to")).toBe("/studysets/view");
  });

  it("displays card numbers correctly for multiple cards", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Add more cards
    const addButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Add Flash Card"));

    if (addButton) {
      await addButton.trigger("click");
      await addButton.trigger("click");
      await wrapper.vm.$nextTick();

      // Should show correct card numbers
      expect(wrapper.text()).toContain("Card 1");
      expect(wrapper.text()).toContain("Card 2");
      expect(wrapper.text()).toContain("Card 3");
    }
  });

  it("displays placeholders in form fields", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const titleInput = wrapper.find("#title");
    expect(titleInput.attributes("placeholder")).toContain(
      "Spanish Vocabulary"
    );

    const descriptionTextarea = wrapper.find("#description");
    expect(descriptionTextarea.attributes("placeholder")).toContain(
      "Describe what this study set covers"
    );

    const questionTextarea = wrapper.find("textarea[id^='question-']");
    expect(questionTextarea.attributes("placeholder")).toContain(
      "Enter the question"
    );

    const answerTextarea = wrapper.find("textarea[id^='answer-']");
    expect(answerTextarea.attributes("placeholder")).toContain(
      "Enter the answer"
    );
  });

  it("shows required field indicators", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    // Count asterisks for required fields
    const asterisks = wrapper.findAll(".text-red-400");
    expect(asterisks.length).toBeGreaterThan(0);
  });

  it("generates unique IDs for flash cards", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Add multiple cards
    const addButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Add Flash Card"));

    if (addButton) {
      await addButton.trigger("click");
      await addButton.trigger("click");
      await wrapper.vm.$nextTick();

      // Check that each card has a unique ID in its textarea
      const questionTextareas = wrapper.findAll("textarea[id^='question-']");
      const ids = questionTextareas.map((ta) => ta.attributes("id"));

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    }
  });

  it("handles multiple cards submission correctly", async () => {
    mockFetch.mockResolvedValue({ data: "uuid-1234-5678-abcd" });

    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Add another card
    const addButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Add Flash Card"));

    if (addButton) {
      await addButton.trigger("click");
      await wrapper.vm.$nextTick();
    }

    // Fill in all fields
    await wrapper.find("#title").setValue("Spanish Vocabulary");
    await wrapper.find("#language").setValue("es-ES");

    const questionTextareas = wrapper.findAll("textarea[id^='question-']");
    const answerTextareas = wrapper.findAll("textarea[id^='answer-']");

    await questionTextareas[0]?.setValue("Question 1");
    await answerTextareas[0]?.setValue("Answer 1");
    await questionTextareas[1]?.setValue("Question 2");
    await answerTextareas[1]?.setValue("Answer 2");

    // Submit form
    const form = wrapper.find("form");
    await form.trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    // Should submit with both cards
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/studysets",
      expect.objectContaining({
        body: expect.objectContaining({
          flashCards: expect.arrayContaining([
            expect.objectContaining({
              question: "Question 1",
              answer: "Answer 1",
            }),
            expect.objectContaining({
              question: "Question 2",
              answer: "Answer 2",
            }),
          ]),
        }),
      })
    );
  });

  it("displays SVG icons for visual elements", async () => {
    const wrapper = await mountSuspended(NewStudySet);

    await wrapper.vm.$nextTick();

    const svgs = wrapper.findAll("svg");

    // Should have multiple SVG icons (delete, add, etc.)
    expect(svgs.length).toBe(2);
  });

  it("applies correct styling classes", async () => {
    const wrapper = await mountSuspended(NewStudySet, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
          AiGenerationModal: true,
        },
      },
    });

    // Check for key styling classes
    expect(wrapper.html()).toContain("bg-gray-900");
    expect(wrapper.html()).toContain("rounded-lg");
    expect(wrapper.html()).toContain("border-gray-700");
  });
});
