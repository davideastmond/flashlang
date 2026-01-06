import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Index from "~/pages/index.vue";

// Mock useAuth composable with a mutable status object
const authStatus = { value: "unauthenticated" };
const authData = { value: null };

mockNuxtImport("useAuth", () => {
  return () => ({
    status: authStatus.value,
    data: authData.value,
  });
});

describe("Landing Page Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for unauthenticated users", async () => {
    authStatus.value = "unauthenticated";
    authData.value = null;

    const wrapper = await mountSuspended(Index, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
    });

    // Check logo
    expect(wrapper.text()).toContain("Flash");
    expect(wrapper.text()).toContain("lang");

    // Check hero section
    expect(wrapper.text()).toContain("Master Any Language,");
    expect(wrapper.text()).toContain("One Flash at a Time");

    // Check for "Get Started Free" button (not "Go to Dashboard")
    expect(wrapper.text()).toContain("Get Started Free");
    expect(wrapper.text()).not.toContain("Go to Dashboard");

    // Check features
    expect(wrapper.text()).toContain("Lightning Fast");
    expect(wrapper.text()).toContain("AI-Powered");
    expect(wrapper.text()).toContain("Multi-Language");
  });

  it("renders correctly for authenticated users", async () => {
    authStatus.value = "authenticated";
    authData.value = { user: { email: "test@example.com" } };

    const wrapper = await mountSuspended(Index, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
    });

    // Check logo
    expect(wrapper.text()).toContain("Flash");
    expect(wrapper.text()).toContain("lang");

    // Check hero section
    expect(wrapper.text()).toContain("Master Any Language,");
    expect(wrapper.text()).toContain("One Flash at a Time");

    // Check for "Go to Dashboard" button (not "Get Started Free")
    expect(wrapper.text()).toContain("Go to Dashboard");
    expect(wrapper.text()).not.toContain("Get Started Free");

    // Check features
    expect(wrapper.text()).toContain("Lightning Fast");
    expect(wrapper.text()).toContain("AI-Powered");
    expect(wrapper.text()).toContain("Multi-Language");
  });
});
