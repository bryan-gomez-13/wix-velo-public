import { session } from 'wix-storage';
import wixLocation from 'wix-location';

$w.onReady(function () {
	$w('#tFibras').onClick(() => {session.setItem("multiCheck", 'Fibras'), wixLocation.to('/catalogo-de-productos')})
	$w('#iFibras').onClick(() => {session.setItem("multiCheck", 'Fibras'), wixLocation.to('/catalogo-de-productos')})
	$w('#tFTTX').onClick(() => {session.setItem("multiCheck", 'FTTx'), wixLocation.to('/catalogo-de-productos')})
	$w('#iFTTX').onClick(() => {session.setItem("multiCheck", 'FTTx'), wixLocation.to('/catalogo-de-productos')})
});