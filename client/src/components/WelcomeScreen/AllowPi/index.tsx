import React from 'react';
import { useState } from 'react';
import styles from './AllowPi.module.css';
import { logo } from '../../../assets/images';
import { CreateUserDTO } from '../../../types/user';
import { PaymentDTO } from '../../../types/payment';
import { fetchWithCredentials } from '../../../hooks/useApi';
import { INCOMPLETE_PAYMENT_URL, SIGN_IN_URL } from '../../../constants/url.constants';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LoadingSpinner } from '../../LoadingSpinner/LoadingSpinner';

type Props = {
	setCloseFingerPrint: React.Dispatch<React.SetStateAction<boolean>>;
};

// eslint-disable-next-line no-unused-vars
export const AllowPi = ({ setCloseFingerPrint }: Props) => {
	const [toggleActive, setToggleActive] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const navigate = useNavigate();
	const handleCheckbox = () => {
		setToggleActive(!toggleActive);
	};

	const onIncompletePaymentFound = async (payment: PaymentDTO) => {
		console.log('onIncompletePaymentFound', payment);
		return await fetchWithCredentials(INCOMPLETE_PAYMENT_URL, {
			method: 'GET',
		});
	};

	const signInUser = async (authResult: CreateUserDTO) => {
		return await fetchWithCredentials(SIGN_IN_URL, {
			method: 'POST',
			data: { authResult },
		});
	};

	const scopes = ['username', 'payments'];
	const signIn = async () => {
		try {
			if (toggleActive == true) {
				setIsLoading(true);
				setIsError(false);
				const authResult: CreateUserDTO = await window.Pi.authenticate(
					scopes,
					onIncompletePaymentFound
				);
				console.log(authResult);
				const user = await signInUser(authResult);
				console.log(user);
				setIsLoading(false);
				navigate('/share-location');
			}
		} catch (error) {
			setIsLoading(false);
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					console.error('Error:', error);
					navigate('/welcome');
				}
				setIsError(true);
				console.error('Error:', error);
				throw error;
			}
			setIsError(true);
			console.error('Error:', error);
			throw error;
		}
	};

	return (
		<div className={styles.allowPi}>
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					<div className={styles.img__and__header}>
						<img src={logo} alt="Pailot Logo" />
						<h3>Welcome to Pailot!</h3>
					</div>
					<p>
						Pailot connect your Pi Network account to experience the best web 3 delivery service
					</p>
					<div className={styles.cta__container}>
						<label className={styles.tick}>
							<input type="checkbox" onChange={handleCheckbox} />
							<p>I agree to allow Pailot connect to my Pi account </p>
						</label>
						<button
							onClick={signIn}
							className={`${styles.allowBtn} ${
								toggleActive ? styles.allowBtnActive : styles.allowBtnInactive
							}`}
							disabled={!toggleActive}
						>
							Allow Pi Network
						</button>
						<p className={styles.terms}>
							Learn more about Pailot <a href="#terms">terms and conditions</a>
						</p>
					</div>
				</>
			)}
			{isError && <div className={styles.error}>Error connecting to Pi. Please try Again</div>}
		</div>
	);
};
