import { FastifyInstance } from "fastify";
import { prisma } from "./lib/prisma";
import { z } from "zod";
import dayjs from "dayjs";

export async function appRoutes(app: FastifyInstance) {
  app.post("/habit", async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    const today = dayjs().startOf("day").toDate();
    //console.log(typeof today);

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
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
    const parsedDate = dayjs(date).startOf("day");

    const week_day = parsedDate.get("day");

    /* 
    const dateConverted = dayjs(date).format("YYYY");
    const formatted = new Date(dateConverted); */
    //console.log(formatted, typeof formatted)
    /*     const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const daily = date.getDate();
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${daily
      .toString()
      .padStart(2, "0")}`;
    console.log(formattedDate); */

    //const form = formattedDate.toDate();

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            weekDay: week_day,
          },
        },
      },
    });

    //console.log(date);
    const day = await prisma.day.findFirst({
      where: {
        date: date,
      },
      include: {
        dayHabits: true,
      },
    });

    //console.log(day);

    const completedHabits =
      day?.dayHabits.map((dayHabit) => {
        return dayHabit.habitId;
      }) ?? [];
    //console.log(completedHabits);

    return {
      possibleHabits,
      completedHabits,
    };
  });

  app.patch("/habits/:id/toggle", async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = toggleHabitParams.parse(request.params);

    const today = dayjs().startOf("day").toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        dayId_habitId: {
          dayId: day.id,
          habitId: id,
        },
      },
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      await prisma.dayHabit.create({
        data: {
          dayId: day.id,
          habitId: id,
        },
      });
    }
  });

  app.get("/summary", async () => {
    const summary = await prisma.$queryRaw`
      SELECT 
      D.id, 
      D.date,
      (
        SELECT 
          cast(count(*) as float)
        FROM day_habit DH 
        WHERE DH.day_id = D.id
      ) as completed,
      (
        SELECT
          cast(count(*) as float)
        FROM habit_week_days HWD
        JOIN habit H 
          ON H.id = HWD.habit_id
        WHERE 
          HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
          AND H.created_at <= D.date 
      ) as amount
      FROM day D
    `;
    return summary;
  });
}
