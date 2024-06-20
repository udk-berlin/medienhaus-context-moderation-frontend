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

	return <section className="login">
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor="user">username</label>
				<input type="text" name="user" placeholder="u.name" required />
			</div>
			<div>
				<label htmlFor="password">password</label>
				<input type="password" name="password" placeholder="••••••••••••••••••••••••" required />
			</div>
			<div>
				<button type="submit">LOGIN</button>
			</div>
			<ul>
				{errors.map((msg, i) => <li key={i} className="error-msg">{msg}</li>)}
			</ul>
		</form>
	</section>;
}

export default Login;
