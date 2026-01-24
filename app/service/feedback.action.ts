import { Resend } from "resend";
import z from "zod";
import type { Route } from "../routes/+types/($lang).feedback";

export type FieldErrors = Partial<Record<"senderEmail" | "subject" | "content", string>>;

export type ActionData = { ok: true; message: string } | { ok: false; fieldErrors?: FieldErrors; formError?: string };

const emailSchema = z.object({
	senderEmail: z.email(),
	subject: z.string().trim().min(1, "Subject is required."),
	content: z.string().trim().min(1, "Content is required."),
});

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();

	const parsed = emailSchema.safeParse({
		senderEmail: formData.get("senderEmail")?.toString().trim(),
		subject: formData.get("subject")?.toString().trim(),
		content: formData.get("content")?.toString().trim(),
	});

	// 1) Validation error → 400 + fieldErrors
	if (!parsed.success) {
		const tree = z.treeifyError(parsed.error);

		const data = {
			ok: false,
			fieldErrors: {
				senderEmail: tree.properties?.senderEmail?.errors[0],
				subject: tree.properties?.subject?.errors[0],
				content: tree.properties?.content?.errors[0],
			},
		} satisfies ActionData;

		return Response.json(data, { status: 400 });
	}

	const { senderEmail, subject, content } = parsed.data;

	try {
		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) {
			console.error("RESEND_API_KEY is missing.");
			const data = {
				ok: false,
				formError: "메일 전송에 실패했어요. 잠시 후 다시 시도해주세요.",
			} satisfies ActionData;

			return Response.json(data, { status: 500 });
		}

		const resend = new Resend(apiKey);
		await resend.emails.send({
			from: `delivered@resend.dev`, // TODO: 검증된 도메인의 발신 주소이다. 사용자의 이메일 주소가 아님 e.g. 앱이름 <no-reply.서브도메인>
			to: "zentechie7@gmail.com", // TODO: 전달받을 나의 이메일 주소
			replyTo: senderEmail, // 사용자의 이메일 주소 -> 사용자가 회신받는 메일 주소임
			subject,
			text: content,
			headers: {
				"X-Source": "feedback/issue",
			},
		});

		const data = {
			ok: true,
			message: "메일을 전송했어요.",
		} satisfies ActionData;

		return Response.json(data, { status: 200 });
	} catch (err) {
		console.error("Email send failed:", err);

		const data = {
			ok: false,
			formError: "메일 전송에 실패했어요. 잠시 후 다시 시도해주세요.",
		} satisfies ActionData;

		return Response.json(data, { status: 502 });
	}
}
