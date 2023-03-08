let connectbutton = document.getElementById('connect');
let logterminal = document.getElementById('terminal');
let disconnectbutton = document.getElementById('disconnect');

connectbutton.addEventListener('click', function(){
	connect();
});

disconnectbutton.addEventListener('click', function(){
	disconnect();
});
	

let dcache = null;
let ccache = null;
let rBuffer = '';

function connect() {
	return (dcache ? Promise.resolve(dcache):
		ReqBluthDevice()).
		then(device => cDCC(device)).
		then(characteristic => startNotifications(characteristic)).
		catch(error => log(error));
}

function ReqBluthDevice() {
	
	log('Requesting bluetooth device.');
	
	return navigator.bluetooth.requestDevice({
		filters: [{services: [0xFFE0]}],
	}).
	
	then(device => {
		log('""' + device.name + '"bluetooth device selected"');
		dcache = device;
		
		dcache.addEventListener('gattserverdisconnected', handleDisconnection);
		
		return dcache;
	});
}


function cDCC(device) {
	if (device.gatt.connected && ccache){
		return Promise.resolve(ccache);
	}
	
	log('Connect to GATT server');
	
	return device.gatt.connect().
		then(server => {
			log('gatt connected');
			return server.getPrimaryService(0xFFE0);
		}).
		
		then(service => {
			log('service found');
			return service.getCharacteristic(0xFFE1);
		}).
		
		then(characteristic => {
			log('c found');
			ccache = characteristic;
			
			return ccache;
		});
}

function startNotifications(characteristic){
	return characteristic.startNotifications().
		then(() => {
			log('started noti');
			characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
		});
}

function handleDisconnection(event){
	let device = event.target;
	
	cDCC(device).
		then(characteristic => startNotifications(characteristic)).
		catch(error => log(error));
}

function log(data, type = ''){
	logterminal.insertAdjacentHTML('beforeend', '<div' + (type ? ' class="' + type + '"' : '') + '>' + data + '</div>');
}
if (ccache){
	ccache.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
	ccache = null;
}


function handleCharacteristicValueChanged(event){
	let value = new TextDecoder().decode(event.target.value);
	
	for (let a of value){
		if(a === '\n'){
			let data = rBuffer.trim();
			rBuffer = '';
			
			if(data){
				receive(data);
			}
		}else{
			rBuffer += a;
		}
	}
}

function recieve(data){
	log(data, 'in');
}


function send(data){
	data = String(data);
	
	if(!data || !ccache){
		return;
	}
	
	data += '\n';
	
	if (data.length > 20){
		let chunks = data.match(/([\r\n]){1, 20}/g);
		writeToCharacteristic(ccache, chunks[0]);
		for(let i = 1; i < chunks.length; i++){
			setTimeout(() => {writeToCharacteristic(ccache, chunks[i]);}, i*100);
		}
	}else {
		writeToCharacteristic(ccache, data);
	}
	
	writeToCharacteristic(ccache, data);
}

function writeToCharacteristic(characteristic, data){
	characteristic.writeValue(new TextEncoder().encode(data));
}

function disconnect(){
	if(dcache){
		log('Disconnnecting from"' + dcache.name + '" bluetooth device');
		dcache.removeEventListener('gattserverdisconnected', handleDisconnection);
		
		if(dcache.gatt.connected){
			dcache.gatt.disconnect();
			log('bluetooth device disconnect');
		} else {
		log('bluetooth device alr disconnected');
	}
	
	if(ccache){
		ccache.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
		ccache = null;
	}
	dcache = null;
}
}

