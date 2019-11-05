import tensorflow as tf
import tensorlayer as tl
import numpy as np
from tensorlayer.cost import cross_entropy_seq, cross_entropy_seq_with_mask
from tqdm import tqdm
from sklearn.utils import shuffle
from data.new_support import data
from tensorlayer.models.seq2seq import Seq2seq
from tensorlayer.models.seq2seq_with_attention import Seq2seqLuongAttention
import os


'''
Load metadata, training , test and validation sets
'''
def initialise(dataset):
    metadata, idx_q, idx_a = data.load_data(PATH='data/{}/'.format(dataset))
    (trainingX, trainingY), (testingX, testingY), (validatingX, validatingY) = data.split_dataset(idx_q, idx_a)
    trainingX = tl.prepro.remove_pad_sequences(trainingX.tolist())
    trainingY = tl.prepro.remove_pad_sequences(trainingY.tolist())
    testingX = tl.prepro.remove_pad_sequences(testingX.tolist())
    testingY = tl.prepro.remove_pad_sequences(testingY.tolist())
    validatingX = tl.prepro.remove_pad_sequences(validatingX.tolist())
    validatingY = tl.prepro.remove_pad_sequences(validatingY.tolist())
    return metadata, trainingX, trainingY, testingX, testingY, validatingX, validatingY



if __name__ == "__main__":
    dataset = "support"

    #data preprocessing
    metadata, trainingX, trainingY, testingX, testingY, validatingX, validatingY = initialise(dataset)

    # Parameters
    src_len = len(trainingX)
    tgt_len = len(trainingY)
    #sequence to sequence require source and target sequences of equal length
    assert src_len == tgt_len

    batch_size = 32
    n_step = src_len // batch_size
    vocab_size_src = len(metadata['idx2w']) 
    emb_dim = 1024

    word_to_index = metadata['w2idx']   # dictionary of word 2 index
    index_to_word = metadata['idx2w']   # dictionary of index 2 word

    unk_id = word_to_index['unk']   
    pad_id = word_to_index['_']     

    start_id = vocab_size_src  
    end_id = vocab_size_src + 1  

    word_to_index.update({'start_id': start_id})
    word_to_index.update({'end_id': end_id})
    index_to_word = index_to_word + ['start_id', 'end_id']

    vocab_size_src = tgt_vocab_size = vocab_size_src + 2

    num_epochs = 50
    vocabulary_size = vocab_size_src
    

    '''
    Function to find predictions
    '''
    def inference(seed, top_n):
        model_.eval()
        seed_id = [word_to_index.get(w, unk_id) for w in seed.split(" ")]
        sentence_id = model_(inputs=[[seed_id]], seq_length=20, start_token=start_id, top_n = top_n)
        sentence = []
        for w_id in sentence_id[0]:
            w = index_to_word[w_id]
            if w == 'end_id':
                break
            sentence = sentence + [w]
        return sentence

    decoder_seq_length = 20
    #initialise model
    model_ = Seq2seq(
        decoder_seq_length = decoder_seq_length,
        cell_enc=tf.keras.layers.GRUCell,
        cell_dec=tf.keras.layers.GRUCell,
        n_layer=3,
        n_units=256,
        embedding_layer=tl.layers.Embedding(vocabulary_size=vocabulary_size, embedding_size=emb_dim),
        )
     
    
    optimizer = tf.optimizers.Adam(learning_rate=0.001)
    model_.train()
    
    user_inputs = ["My phone shows a black screen.","I want to install Lightroom Classic"]
    #train 
    for epoch in range(num_epochs):
        model_.train()
        trainingX, trainingY = shuffle(trainingX, trainingY, random_state=0)
        total_loss, n_iter = 0, 0
        for X, Y in tqdm(tl.iterate.minibatches(inputs=trainingX, targets=trainingY, batch_size=batch_size, shuffle=False), 
                        total=n_step, desc='Epoch[{}/{}]'.format(epoch + 1, num_epochs), leave=False):

            X = tl.prepro.pad_sequences(X)
            _target_seqs = tl.prepro.sequences_add_end_id(Y, end_id=end_id)
            _target_seqs = tl.prepro.pad_sequences(_target_seqs, maxlen=decoder_seq_length)
            _decode_seqs = tl.prepro.sequences_add_start_id(Y, start_id=start_id, remove_last=False)
            _decode_seqs = tl.prepro.pad_sequences(_decode_seqs, maxlen=decoder_seq_length)
            _target_mask = tl.prepro.sequences_get_mask(_target_seqs)

            with tf.GradientTape() as tape:
                
                output = model_(inputs = [X, _decode_seqs])
                
                output = tf.reshape(output, [-1, vocabulary_size])
                
		#calculates loss
                loss = cross_entropy_seq_with_mask(logits=output, target_seqs=_target_seqs, input_mask=_target_mask)

                grad = tape.gradient(loss, model_.all_weights)
                optimizer.apply_gradients(zip(grad, model_.all_weights))
            
            total_loss += loss
            n_iter += 1

      
        print('Epoch [{}/{}]: loss {:.4f}'.format(epoch + 1, num_epochs, total_loss / n_iter))
	
        for seed in user_inputs:
            print("Query >", seed)
            top_n = 1
            for i in range(top_n):
                sentence = inference(seed, top_n)
                print(" >", ' '.join(sentence))
        #save weights
        tl.files.save_npz(model_.all_weights, name='model.npz')


        
    
    
