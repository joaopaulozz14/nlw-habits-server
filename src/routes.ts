import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import { z } from "zod";
import dayjs from "dayjs";

export async function appRoutes(app: FastifyInstance) {
  app.post("/habits", async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    const today = dayjs().startOf("day").toDate();

    await prisma.habit.create({
      data: {
        title,
        createdAt: today,
        weekDays: {
          create: weekDays.map((week_day) => {
            return {
              weekDay: week_day,
            };
          }),
        },
      },
    });
  });

  app.get("/day", async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    const { date } = getDayParams.parse(request.query);
    //o day retorna o dia da semana, se quiser o dia atual passado precisa usar o "date"
    const parsedDate = dayjs(date).add(3, "h");
    const week_day = dayjs(parsedDate).get("day");

    console.log(date, week_day);
    const possibleHabits = await prisma.habit.findMany({
      where: {
        createdAt: {
          lte: date,
        },
        weekDays: {
          some: {
            weekDay: week_day,
          },
        },
      },
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      select: {
        dayHabits: true,
      },
    });
    console.log(day);
    return {
      possibleHabits,
      day,
    };
  });
}
