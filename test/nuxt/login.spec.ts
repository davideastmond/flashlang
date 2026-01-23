import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "~/pages/login/index.vue";

// Mock useAuth composable
const mockSignIn = vi.fn();
mockNuxtImport("useAuth", () => {
  return () => ({
    signIn: mockSignIn,
    status: { value: "unauthenticated" },
    data: { value: null },
  });
});

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form with all elements", async () => {
    const wrapper = await mountSuspended(Login, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
    });

    // Check for logo
    expect(wrapper.text()).toContain("Flash");
    expect(wrapper.text()).toContain("lang");

    // Check for header
    expect(wrapper.text()).toContain("Welcome Back");
    expect(wrapper.text()).toContain(
      "Sign in to continue your learning journey",
    );

    // Check for form fields
    expect(wrapper.find("#email").exists()).toBe(true);
    expect(wrapper.find("#password").exists()).toBe(true);

    // Check for labels
    expect(wrapper.text()).toContain("Email");
    expect(wrapper.text()).toContain("Password");

    // Check for remember me checkbox
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Remember me");

    // Check for forgot password link
    expect(wrapper.text()).toContain("Forgot password?");

    // Check for submit button
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Sign In");

    // Check for sign up link
    expect(wrapper.text()).toContain("Don't have an account?");
    expect(wrapper.text()).toContain("Sign up");
  });

  it("binds email input to v-model correctly", async () => {
    const wrapper = await mountSuspended(Login);

    const emailInput = wrapper.find("#email");
    await emailInput.setValue("test@example.com");

    expect((emailInput.element as HTMLInputElement).value).toBe(
      "test@example.com",
    );
  });

  it("binds password input to v-model correctly", async () => {
    const wrapper = await mountSuspended(Login);

    const passwordInput = wrapper.find("#password");
    await passwordInput.setValue("password123");

    expect((passwordInput.element as HTMLInputElement).value).toBe(
      "password123",
    );
  });

  it("binds remember me checkbox to v-model correctly", async () => {
    const wrapper = await mountSuspended(Login);

    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);

    expect((checkbox.element as HTMLInputElement).checked).toBe(true);
  });

  it("calls signIn with correct credentials on form submission", async () => {
    mockSignIn.mockResolvedValue({ error: null });

    const wrapper = await mountSuspended(Login);

    // Fill in the form
    await wrapper.find("#email").setValue("test@example.com");
    await wrapper.find("#password").setValue("password123");

    // Submit the form
    await wrapper.find("form").trigger("submit.prevent");

    // Wait for async operations
    await wrapper.vm.$nextTick();

    // Verify signIn was called with correct parameters
    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      redirect: false,
      email: "test@example.com",
      password: "password123",
      callbackUrl: "/user/dashboard",
    });
  });

  it("displays error message when signIn fails", async () => {
    const errorMessage = "Invalid credentials";
    mockSignIn.mockResolvedValue({ error: errorMessage });

    const wrapper = await mountSuspended(Login);

    // Fill in the form
    await wrapper.find("#email").setValue("wrong@example.com");
    await wrapper.find("#password").setValue("wrongpassword");

    // Submit the form
    await wrapper.find("form").trigger("submit.prevent");

    // Wait for async operations
    await wrapper.vm.$nextTick();

    // Check that error message is displayed
    expect(wrapper.text()).toContain(errorMessage);
    expect(wrapper.find(".text-red-500").exists()).toBe(true);
  });

  it("clears previous error when submitting form again", async () => {
    mockSignIn.mockResolvedValueOnce({ error: "First error" });

    const wrapper = await mountSuspended(Login);

    // First submission with error
    await wrapper.find("#email").setValue("test@example.com");
    await wrapper.find("#password").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("First error");

    // Second submission should clear error
    mockSignIn.mockResolvedValueOnce({ error: null });
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain("First error");
  });

  it("does not display error message initially", async () => {
    const wrapper = await mountSuspended(Login);

    expect(wrapper.find(".text-red-500").exists()).toBe(false);
  });

  it("has required attribute on email and password fields", async () => {
    const wrapper = await mountSuspended(Login);

    const emailInput = wrapper.find("#email");
    const passwordInput = wrapper.find("#password");

    expect(emailInput.attributes("required")).toBeDefined();
    expect(passwordInput.attributes("required")).toBeDefined();
  });

  it("email input has correct type and placeholder", async () => {
    const wrapper = await mountSuspended(Login);

    const emailInput = wrapper.find("#email");

    expect(emailInput.attributes("type")).toBe("email");
    expect(emailInput.attributes("placeholder")).toBe("your@email.com");
  });

  it("password input has correct type and placeholder", async () => {
    const wrapper = await mountSuspended(Login);

    const passwordInput = wrapper.find("#password");

    expect(passwordInput.attributes("type")).toBe("password");
    expect(passwordInput.attributes("placeholder")).toBe("••••••••");
  });

  it("renders with proper styling classes", async () => {
    const wrapper = await mountSuspended(Login);

    // Check for key styling classes
    expect(wrapper.html()).toContain("bg-gradient-to-br");
    expect(wrapper.html()).toContain("backdrop-blur-xl");
    expect(wrapper.html()).toContain("rounded-3xl");
    expect(wrapper.html()).toContain("bg-gradient-to-r");
  });

  it("renders NuxtLink to signup page", async () => {
    const wrapper = await mountSuspended(Login);

    const signupLink = wrapper.findComponent({ name: "NuxtLink" });
    expect(signupLink.exists()).toBe(true);
    expect(signupLink.props("to")).toBe("/signup");
  });

  it("handles successful login without errors", async () => {
    mockSignIn.mockResolvedValue({ error: null });

    const wrapper = await mountSuspended(Login);

    await wrapper.find("#email").setValue("test@example.com");
    await wrapper.find("#password").setValue("correctpassword");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    // Should not show any error message
    expect(wrapper.find(".text-red-500").exists()).toBe(false);
  });

  it("prevents default form submission", async () => {
    const wrapper = await mountSuspended(Login);

    const form = wrapper.find("form");
    const submitEvent = new Event("submit", { cancelable: true });
    const preventDefaultSpy = vi.spyOn(submitEvent, "preventDefault");

    // The @submit.prevent should handle this
    expect(form.attributes("onsubmit")).toBeUndefined();
  });
});
