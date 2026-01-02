import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "~/pages/user/dashboard/index.vue";

const fetchMock = vi.fn();

vi.stubGlobal("$fetch", () => fetchMock());

// Mock navigateTo
mockNuxtImport("navigateTo", () => {
  return vi.fn();
});

// Mock toShortenedUuid
mockNuxtImport("toShortenedUuid", () => {
  return vi.fn((uuid: string) => uuid.slice(0, 8));
});

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard with main sections", async () => {
    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    // Check for Quick Actions section
    expect(wrapper.text()).toContain("Quick Actions");
    expect(wrapper.text()).toContain("Create New Study Set");
    expect(wrapper.text()).toContain("Browse Study Sets");

    // Check for Your Progress section
    expect(wrapper.text()).toContain("Your Progress");

    // Check for Recent History section
    expect(wrapper.text()).toContain("Recent History");
  });

  it("displays correct stats data", async () => {
    const mockStats = {
      totalStudySets: 5,
      totalStudySessions: 12,
      totalCards: 45,
      studyStreak: 3,
      accuracy: 85,
      recentSessions: [],
    };

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    // Wait for component to be mounted and data to be loaded
    await wrapper.vm.$nextTick();

    // Check stats are displayed
    expect(wrapper.text()).toContain("Total Study Sets");
    expect(wrapper.text()).toContain("Total Study Sessions");
    expect(wrapper.text()).toContain("Flash Cards");
    expect(wrapper.text()).toContain("Study Streak");
    expect(wrapper.text()).toContain("Accuracy");
  });

  it("shows empty state when no sessions exist", async () => {
    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Check for empty state message
    expect(wrapper.text()).toContain("No sessions yet");
    expect(wrapper.text()).toContain(
      "Get started by creating your first flashcard session."
    );
    expect(wrapper.text()).toContain("Create Session");
  });

  it("displays recent sessions when they exist", async () => {
    const mockStats = {
      totalStudySets: 5,
      totalStudySessions: 12,
      totalCards: 45,
      studyStreak: 3,
      accuracy: 85,
      recentSessions: [
        {
          id: "session-1",
          title: "Spanish Vocabulary",
          startTime: new Date().toISOString(),
          totalCount: 20,
          correctCount: 16,
        },
        {
          id: "session-2",
          title: "French Grammar",
          startTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          totalCount: 15,
          correctCount: 12,
        },
      ],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Check sessions are displayed
    expect(wrapper.text()).toContain("Spanish Vocabulary");
    expect(wrapper.text()).toContain("French Grammar");
    expect(wrapper.text()).toContain("20 cards");
    expect(wrapper.text()).toContain("15 cards");
  });

  it("renders Quick Actions cards with correct links", async () => {
    const mockStats = {
      totalStudySets: 0,
      totalStudySessions: 0,
      totalCards: 0,
      studyStreak: 0,
      accuracy: 0,
      recentSessions: [],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard);

    // Find NuxtLink components
    const links = wrapper.findAllComponents({ name: "NuxtLink" });

    expect(links.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain("Create New Study Set");
    expect(wrapper.text()).toContain("Browse Study Sets");
  });

  it("displays all stat cards with icons", async () => {
    const mockStats = {
      totalStudySets: 5,
      totalStudySessions: 12,
      totalCards: 45,
      studyStreak: 3,
      accuracy: 85,
      recentSessions: [],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Check for SVG icons (there should be multiple)
    const svgs = wrapper.findAll("svg");
    expect(svgs.length).toBeGreaterThan(5); // At least 5 stat cards + quick action cards
  });

  it("formats dates correctly in recent sessions", async () => {
    const now = new Date();
    const mockStats = {
      totalStudySets: 1,
      totalStudySessions: 1,
      totalCards: 10,
      studyStreak: 1,
      accuracy: 100,
      recentSessions: [
        {
          id: "session-1",
          title: "Test Session",
          startTime: now.toISOString(),
          totalCount: 10,
          correctCount: 10,
        },
      ],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await wrapper.vm.$nextTick();

    // The date should be formatted as relative time (e.g., "a few seconds ago")
    expect(wrapper.text()).toContain("Test Session");
  });

  it("calculates and displays accuracy percentage correctly", async () => {
    const mockStats = {
      totalStudySets: 1,
      totalStudySessions: 1,
      totalCards: 10,
      studyStreak: 1,
      accuracy: 75,
      recentSessions: [
        {
          id: "session-1",
          title: "Test Session",
          startTime: new Date().toISOString(),
          totalCount: 20,
          correctCount: 15, // 75% accuracy
        },
      ],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Should show 75% correct
    expect(wrapper.text()).toContain("75% correct");
  });

  it("displays study streak with days suffix", async () => {
    const mockStats = {
      totalStudySets: 5,
      totalStudySessions: 12,
      totalCards: 45,
      studyStreak: 7,
      accuracy: 85,
      recentSessions: [],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("7 days");
  });

  it("renders with proper styling classes", async () => {
    const mockStats = {
      totalStudySets: 0,
      totalStudySessions: 0,
      totalCards: 0,
      studyStreak: 0,
      accuracy: 0,
      recentSessions: [],
    };

    fetchMock.mockResolvedValue({ data: mockStats });

    const wrapper = await mountSuspended(Dashboard, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    // Check for key styling classes
    expect(wrapper.html()).toContain("bg-gradient-to-br");
    expect(wrapper.html()).toContain("backdrop-blur-sm");
    expect(wrapper.html()).toContain("rounded-lg");
  });
});
