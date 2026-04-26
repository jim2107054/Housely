function deprecatedAuthRoute() {
	return Response.json(
		{
			error: "NextAuth route is deprecated. This app uses Clerk authentication.",
		},
		{ status: 410 }
	);
}

export const GET = deprecatedAuthRoute;
export const POST = deprecatedAuthRoute;
