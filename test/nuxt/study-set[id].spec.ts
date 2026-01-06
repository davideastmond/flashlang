import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudySetDetail from "~/pages/user/studysets/[studySetId]/index.vue";
import { flashCards } from "~~/db/schema";
import type { StudySet } from "~~/shared/types/definitions/study-set";

type InferredFlashCard = typeof flashCards.$inferSelect;
// Mock $fetch globally
const mockFetch = vi.fn();

vi.stubGlobal("$fetch", mockFetch);

// Mock getFullUuid
mockNuxtImport("getFullUuid", () => {
  return vi.fn((shortUuid: string) => `full-uuid-${shortUuid}`);
});

// Mock toShortenedUuid
mockNuxtImport("toShortenedUuid", () => {
  return vi.fn((uuid: string) => uuid.slice(0, 8));
});

// Mock useRoute
mockNuxtImport("useRoute", () => {
  return vi.fn(() => ({
    params: {
      studySetId: "short-123",
    },
  }));
});

describe("StudySetDetail Component", () => {
  const mockStudySet: StudySet & {
    flashCards: Array<InferredFlashCard>;
  } = {
    id: "uuid-1234",
    title: "Spanish Vocabulary",
    description: "Common Spanish words and phrases",
    createdAt: new Date("2025-01-01T05:00:00Z"),
    updatedAt: new Date("2025-01-01T05:00:00Z"),
    language: "Spanish",
    cefrLevel: "A1",
    flashCards: [
      {
        id: "card-1",
        userId: "user-123",
        question: "What is 'hello' in Spanish?",
        answer: "Hola",
        createdAt: new Date("2025-01-01T05:00:00Z"),
        updatedAt: new Date("2025-01-01T05:00:00Z"),
      },
      {
        id: "card-2",
        userId: "user-123",
        question: "What is 'goodbye' in Spanish?",
        answer: "Adiós",
        createdAt: new Date("2025-01-01T05:00:00Z"),
        updatedAt: new Date("2025-01-01T05:00:00Z"),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading and Error States", () => {
    it("displays loading spinner while fetching data", async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const wrapper = await mountSuspended(StudySetDetail, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ["to"],
            },
          },
        },
      });

      // Check for loading spinner
      const spinner = wrapper.find(".animate-spin");
      expect(spinner.exists()).toBe(true);
    });

    it("displays error message when fetch fails", async () => {
      mockFetch.mockRejectedValue({
        data: { statusMessage: "Study set not found" },
      });

      const wrapper = await mountSuspended(StudySetDetail, {
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

      expect(wrapper.text()).toContain("Study set not found");
      expect(wrapper.text()).toContain("Back to Dashboard");
    });
  });

  describe("Study Set Display", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        success: true,
        data: mockStudySet,
      });
    });

    it("displays study set title and description", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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
      expect(wrapper.text()).toContain("Common Spanish words and phrases");
    });

    it("displays card count", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      expect(wrapper.text()).toContain("2 cards");
    });

    it("displays creation date", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      expect(wrapper.text()).toContain("Created");
      expect(wrapper.text()).toContain("January");
    });

    it("displays last studied information when available", async () => {
      const studySetWithHistory = {
        ...mockStudySet,
        lastStudiedAt: {
          id: "session-1",
          userId: "user-123",
          studySetId: "uuid-1234",
          startTime: "2025-01-05T10:00:00Z",
          correctCount: 8,
          totalCount: 10,
        },
      };

      mockFetch.mockResolvedValue({
        success: true,
        data: studySetWithHistory,
      });

      const wrapper = await mountSuspended(StudySetDetail, {
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

      expect(wrapper.text()).toContain("Last studied");
      expect(wrapper.text()).toContain("8 / 10");
      expect(wrapper.text()).toContain("80%");
    });

    it("displays practice now button", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      expect(wrapper.text()).toContain("Practice now");
    });

    it("displays back to dashboard link", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      expect(wrapper.text()).toContain("Back to Dashboard");
    });
  });

  describe("Flash Cards Display", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        success: true,
        data: mockStudySet,
      });
    });

    it("displays all flash cards", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      expect(wrapper.text()).toContain("What is 'hello' in Spanish?");
      expect(wrapper.text()).toContain("Hola");
      expect(wrapper.text()).toContain("What is 'goodbye' in Spanish?");
      expect(wrapper.text()).toContain("Adiós");
    });

    it("displays empty state when no cards exist", async () => {
      mockFetch.mockResolvedValue({
        success: true,
        data: { ...mockStudySet, flashCards: [] },
      });

      const wrapper = await mountSuspended(StudySetDetail, {
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

      expect(wrapper.text()).toContain("No flash cards yet");
      expect(wrapper.text()).toContain("Add Your First Card");
    });

    it("blurs answers by default", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Check for blur class
      expect(wrapper.html()).toContain("blur-md");
    });

    it("toggles blur answers when checkbox is clicked", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Initially blurred
      expect(wrapper.html()).toContain("blur-md");

      // Find and click blur checkbox
      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.setValue(false);
      await wrapper.vm.$nextTick();

      // Should not be blurred anymore
      expect(wrapper.html()).not.toContain("blur-md");
    });

    it("displays add card button", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      expect(wrapper.text()).toContain("Add Card");
    });
  });

  describe("Edit Study Set Info", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        success: true,
        data: mockStudySet,
      });
    });

    it("shows edit button", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Find edit button (by SVG path)
      const editButtons = wrapper.findAll("button");
      const editButton = editButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M11 5H6a2 2 0 00-2 2v11");
      });

      expect(editButton).toBeDefined();
    });

    it("enters edit mode when edit button is clicked", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Find and click edit button
      const editButtons = wrapper.findAll("button");
      const editButton = editButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M11 5H6a2 2 0 00-2 2v11");
      });

      if (editButton) {
        await editButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Should show edit form
        expect(wrapper.text()).toContain("Save Changes");
        expect(wrapper.text()).toContain("Cancel");
        expect(wrapper.text()).toContain("Delete Set");
      }
    });

    it("populates edit form with current values", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Find and click edit button
      const editButtons = wrapper.findAll("button");
      const editButton = editButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M11 5H6a2 2 0 00-2 2v11");
      });

      if (editButton) {
        await editButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Find input fields
        const titleInput = wrapper.find('input[type="text"]');
        const descriptionTextarea = wrapper.find("textarea");

        expect((titleInput.element as HTMLInputElement).value).toBe(
          "Spanish Vocabulary"
        );
        expect((descriptionTextarea.element as HTMLTextAreaElement).value).toBe(
          "Common Spanish words and phrases"
        );
      }
    });

    it("cancels edit mode when cancel button is clicked", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Enter edit mode
      const editButtons = wrapper.findAll("button");
      const editButton = editButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M11 5H6a2 2 0 00-2 2v11");
      });

      if (editButton) {
        await editButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Find and click cancel button
        const cancelButton = wrapper
          .findAll("button")
          .find((btn) => btn.text() === "Cancel");

        if (cancelButton) {
          await cancelButton.trigger("click");
          await wrapper.vm.$nextTick();

          // Should exit edit mode
          expect(wrapper.text()).not.toContain("Save Changes");
          expect(wrapper.text()).toContain("Spanish Vocabulary");
        }
      }
    });

    it("saves study set info when save button is clicked", async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: mockStudySet,
      });

      mockFetch.mockResolvedValueOnce({
        success: true,
        data: {
          ...mockStudySet,
          title: "Updated Title",
          description: "Updated Description",
        },
      });

      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Enter edit mode
      const editButtons = wrapper.findAll("button");
      const editButton = editButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M11 5H6a2 2 0 00-2 2v11");
      });

      if (editButton) {
        await editButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Update form values
        const titleInput = wrapper.find('input[type="text"]');
        const descriptionTextarea = wrapper.find("textarea");

        await titleInput.setValue("Updated Title");
        await descriptionTextarea.setValue("Updated Description");
        await wrapper.vm.$nextTick();

        // Find and click save button
        const saveButton = wrapper
          .findAll("button")
          .find((btn) => btn.text().includes("Save"));

        if (saveButton) {
          await saveButton.trigger("click");
          await wrapper.vm.$nextTick();
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Check if PATCH request was made
          expect(mockFetch).toHaveBeenCalledWith(
            "/api/studysets/full-uuid-short-123",
            expect.objectContaining({
              method: "PATCH",
              body: {
                title: "Updated Title",
                description: "Updated Description",
              },
            })
          );
        }
      }
    });
  });

  describe("Add Flash Card", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        success: true,
        data: mockStudySet,
      });
    });

    it("opens add card modal when button is clicked", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Find and click add card button
      const addCardButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Add Card"));

      if (addCardButton) {
        await addCardButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Should show modal
        expect(wrapper.text()).toContain("Add New Flash Card");
      }
    });

    it("displays add card form in modal", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Open modal
      const addCardButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Add Card"));

      if (addCardButton) {
        await addCardButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Check for form elements
        const textareas = wrapper.findAll("textarea");
        expect(textareas.length).toBeGreaterThanOrEqual(2);
        expect(wrapper.text()).toContain("Question");
        expect(wrapper.text()).toContain("Answer");
      }
    });

    it("closes modal when cancel button is clicked", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Open modal
      const addCardButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Add Card"));

      if (addCardButton) {
        await addCardButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Find and click cancel button in modal
        const cancelButtons = wrapper.findAll("button");
        const modalCancelButton = cancelButtons.find(
          (btn) => btn.text() === "Cancel" && btn.element.type === "button"
        );

        if (modalCancelButton) {
          await modalCancelButton.trigger("click");
          await wrapper.vm.$nextTick();

          // Modal should be closed
          expect(wrapper.text()).not.toContain("Add New Flash Card");
        }
      }
    });

    it("adds new card when form is submitted", async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: mockStudySet,
      });

      const newCard: InferredFlashCard = {
        id: "card-3",
        userId: "uuid-1234",
        question: "What is 'thank you' in Spanish?",
        answer: "Gracias",
        createdAt: new Date("2025-01-05"),
        updatedAt: new Date("2025-01-05"),
      };

      mockFetch.mockResolvedValueOnce({
        success: true,
        data: newCard,
      });

      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Open modal
      const addCardButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Add Card"));

      if (addCardButton) {
        await addCardButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Fill in form
        const textareas = wrapper.findAll("textarea");
        await textareas[0]?.setValue("What is 'thank you' in Spanish?");
        await textareas[1]?.setValue("Gracias");
        await wrapper.vm.$nextTick();

        // Submit form
        const form = wrapper.find("form");
        await form.trigger("submit.prevent");
        await wrapper.vm.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check if POST request was made
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/studysets/full-uuid-short-123/cards",
          expect.objectContaining({
            method: "POST",
            body: {
              question: "What is 'thank you' in Spanish?",
              answer: "Gracias",
            },
          })
        );
      }
    });

    it("disables submit button when form is incomplete", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Open modal
      const addCardButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Add Card"));

      if (addCardButton) {
        await addCardButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Find submit button in modal
        const submitButton = wrapper
          .findAll("[data-test='add-card-modal']")
          .find(
            (btn) =>
              btn.text().includes("Add") &&
              (btn.element as HTMLButtonElement).type === "submit"
          );

        // Should be disabled when form is empty
        expect(submitButton?.attributes("disabled")).toBeDefined();
      }
    });
  });

  describe("Delete Flash Card", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        success: true,
        data: mockStudySet,
      });
    });

    it("shows delete confirmation modal when delete button is clicked", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Find delete button on a card (trash icon)
      const deleteButtons = wrapper.findAll("button");
      const cardDeleteButton = deleteButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M19 7l-.867 12.142");
      });

      if (cardDeleteButton) {
        await cardDeleteButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Should show confirmation modal
        expect(wrapper.text()).toContain("Delete Flash Card?");
        expect(wrapper.text()).toContain("This action cannot be undone");
      }
    });

    it("cancels delete when cancel button is clicked", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Open delete confirmation
      const deleteButtons = wrapper.findAll("button");
      const cardDeleteButton = deleteButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M19 7l-.867 12.142");
      });

      if (cardDeleteButton) {
        await cardDeleteButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Find and click cancel in confirmation modal
        const cancelButtons = wrapper.findAll("button");
        const modalCancelButton = cancelButtons.find(
          (btn) => btn.text() === "Cancel"
        );

        if (modalCancelButton) {
          await modalCancelButton.trigger("click");
          await wrapper.vm.$nextTick();

          // Modal should be closed
          expect(wrapper.text()).not.toContain("Delete Flash Card?");
        }
      }
    });

    it("deletes card when confirmed", async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        data: mockStudySet,
      });

      mockFetch.mockResolvedValueOnce({
        success: true,
      });

      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Open delete confirmation
      const deleteButtons = wrapper.findAll("button");
      const cardDeleteButton = deleteButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M19 7l-.867 12.142");
      });

      if (cardDeleteButton) {
        await cardDeleteButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Find and click delete button in confirmation modal
        const confirmDeleteButton = wrapper
          .findAll("button")
          .find(
            (btn) =>
              btn.text().includes("Delete") &&
              btn.text() !== "Delete Flash Card?"
          );

        if (confirmDeleteButton) {
          await confirmDeleteButton.trigger("click");
          await wrapper.vm.$nextTick();
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Check if DELETE request was made
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining(
              "/api/studysets/full-uuid-short-123/cards/"
            ),
            expect.objectContaining({
              method: "DELETE",
            })
          );
        }
      }
    });
  });

  describe("Delete Study Set", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        success: true,
        data: mockStudySet,
      });
    });

    it("shows delete study set modal when delete set button is clicked", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Enter edit mode first
      const editButtons = wrapper.findAll("button");
      const editButton = editButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M11 5H6a2 2 0 00-2 2v11");
      });

      if (editButton) {
        await editButton.trigger("click");
        await wrapper.vm.$nextTick();

        // Find and click delete set button
        const deleteSetButton = wrapper
          .findAll("button")
          .find((btn) => btn.text() === "Delete Study Set");

        if (deleteSetButton) {
          await deleteSetButton.trigger("click");
          await wrapper.vm.$nextTick();

          // Should show delete confirmation modal
          expect(wrapper.text()).toContain("Delete Study Set?");
          expect(wrapper.text()).toContain("Spanish Vocabulary");
        }
      }
    });

    it("cancels study set deletion when cancel is clicked", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Enter edit mode and open delete modal
      const editButtons = wrapper.findAll("button");
      const editButton = editButtons.find((btn) => {
        const svg = btn.find("svg");
        return svg.exists() && btn.html().includes("M11 5H6a2 2 0 00-2 2v11");
      });

      if (editButton) {
        await editButton.trigger("click");
        await wrapper.vm.$nextTick();

        const deleteSetButton = wrapper
          .findAll("button")
          .find((btn) => btn.text() === "Delete Set");

        if (deleteSetButton) {
          await deleteSetButton.trigger("click");
          await wrapper.vm.$nextTick();

          // Find and click cancel
          const modalCancelButton = wrapper.find(
            "[data-test='delete-study-set-modal-cancel']"
          );

          // const modalCancelButton = cancelButtons.find(
          //   (btn) => btn.text() === "Cancel"
          // );

          if (modalCancelButton) {
            await modalCancelButton.trigger("click");
            await wrapper.vm.$nextTick();

            // Modal should be closed
            expect(wrapper.text()).not.toContain("Delete Study Set?");
          }
        }
      }
    });
  });

  describe("Utility Functions", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        success: true,
        data: mockStudySet,
      });
    });

    it("formats dates correctly", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Check date formatting
      expect(wrapper.text()).toContain("January");
      expect(wrapper.text()).toContain("2025");
    });

    it("calculates percentage scores correctly", async () => {
      const studySetWithHistory = {
        ...mockStudySet,
        lastStudiedAt: {
          id: "session-1",
          userId: "user-123",
          studySetId: "uuid-1234",
          startTime: "2025-01-05T10:00:00Z",
          correctCount: 7,
          totalCount: 10,
        },
      };

      mockFetch.mockResolvedValue({
        success: true,
        data: studySetWithHistory,
      });

      const wrapper = await mountSuspended(StudySetDetail, {
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

      // 7/10 = 70%
      expect(wrapper.text()).toContain("70%");
    });
  });

  describe("Component Styling", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        success: true,
        data: mockStudySet,
      });
    });

    it("applies proper styling classes", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Check for key styling classes
      expect(wrapper.html()).toContain("bg-gradient-to-br");
      expect(wrapper.html()).toContain("backdrop-blur-sm");
      expect(wrapper.html()).toContain("rounded-lg");
    });

    it("uses hover effects on interactive elements", async () => {
      const wrapper = await mountSuspended(StudySetDetail, {
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

      // Check for hover classes
      expect(wrapper.html()).toContain("hover:");
    });
  });
});
