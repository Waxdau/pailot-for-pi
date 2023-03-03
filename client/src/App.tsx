import React from 'react';
import {
	Home,
	Settings,
	SplashScreen,
	WelcomeScreen,
	ShareLocation,
	OnboardingCompleted,
	CustomizedDelivery,
	ActiveDelivery,
	CourierForm,
	CourierDashBoard,
} from './pages';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInFast } from './animations';

function App() {
	return (
		<BrowserRouter>
			<AnimatePresence>
				<motion.div animate={fadeInFast}>
					<AnimatePresence>
						<Routes>
							<Route path="/" element={<SplashScreen />} />
							<Route path="/welcome" element={<WelcomeScreen />} />
							<Route path="/share-location" element={<ShareLocation />} />
							<Route path="/onboarding-completed" element={<OnboardingCompleted />} />
							<Route path="/home" element={<Home />} />
							<Route path="/settings/*" element={<Settings />} />
							<Route path="/courier-form" element={<CourierForm />} />
							<Route path="/dashboard" element={<CourierDashBoard />} />
							<Route path="/customized-delivery" element={<CustomizedDelivery />} />
							<Route path="/active-delivery" element={<ActiveDelivery />} />
						</Routes>
					</AnimatePresence>
				</motion.div>
			</AnimatePresence>
		</BrowserRouter>
	);
}

export default App;
