import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "./lib/prisma"
import { signInSchema } from "./lib/zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = await signInSchema.parseAsync(credentials)
        
        // For Demo: Allow login if password is "password"
        if (password === "password") {
          // Upsert user to ensure they exist in DB
            const user = await prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                    email,
                    name: "Demo User",
                    image: "https://github.com/shadcn.png"
                }
            })
            return user
        }
        return null
      },
    }),
  ],
})
