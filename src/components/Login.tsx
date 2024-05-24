interface LoginProps {
	onSubmit: (user: string, password: string) => void,
	errors: string[]
}

function Login({ onSubmit, errors }: LoginProps) {
	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		onSubmit(
			data.get('user') as string,
			data.get('password') as string
		);
	};

	return <form onSubmit={handleSubmit}>
		<div>
			<input type="text" name="user" placeholder="User name" required />
		</div>
		<div>
			<input type="password" name="password" placeholder="Password" required />
		</div>
		<div>
			<button type="submit">Login</button>
		</div>
		<div>{errors.map((msg, i) => {
			return <div key={i} className="error-msg">{msg}</div>;
		})}</div>
	</form>;
}

export default Login;
